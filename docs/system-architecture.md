# System Architecture

## High-Level Overview

The vn-tvan library provides a schema-driven JSON-to-XML conversion system for Vietnam GDT e-invoices (Messages 200 and 206). The architecture emphasizes:

1. **Declarative Mapping** - Schemas declare transformations once, reused across conversions
2. **Type Safety** - Discriminated union types enforce correct schema shapes at compile time
3. **Performance** - Schema validation memoized per reference via WeakSet
4. **Composability** - Recursive field builders handle nested and array structures
5. **Validation** - Optional Zod runtime validation for business data

## Component Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        Public API                                │
│   createMessage<T>(data: T, opts: CreateMessageOptions)          │
│                    → { toXml(): string }                         │
└────────────────────┬─────────────────────────────────────────────┘
                     │
              ┌──────────┴──────────┐
              │                     │
        ┌─────▼──────────────┐   ┌─▼─────────────────┐
        │ schema-validator   │   │  Message Schemas  │
        │                    │   │                   │
        │ • validateSchema() │   │ • message-206     │
        │ • WeakSet memo     │   │ • message-200     │
        └────────────────────┘   │ • shared-fields   │
                                 └───────────────────┘
                                         │
                                 ┌───────▼────────┐
                                 │  Zod Schemas   │
                                 │  (optional)    │
                                 └───────┬────────┘
                                         │
                            ┌────────────▼───────────┐
                            │   xml-builder          │
                            │                        │
                            │ • buildXml()           │
                            │ • buildFields()        │
                            │ • buildField()         │
                            │ • omitIfEmpty support  │
                            └────────────┬───────────┘
                                         │
                      ┌──────────────────▼────────────┐
                      │    path-resolver              │
                      │                               │
                      │ • resolvePath()               │
                      │ • resolveRequired()           │
                      └───────────────────────────────┘
```

## Data Flow

### Conversion Process

```
Input: JSON Data + MappingSchema + CreateMessageOptions
    │
    ├─ Optional: validate(data) with Zod schema (if opts.validate provided)
    │   └─ Throw ValidationError on invalid data
    │
    ├─ validateSchema(schema)     ← First call: deep validation, memoized
    │   └─ Check discriminated union constraints, required fields
    │
    ├─ buildXml(schema, data)
    │   ├─ Add XML declaration + root + namespace
    │   ├─ buildFields([schema.fields], data)
    │   │   └─ For each field mapping:
    │   │
    │   ├─ buildField(field, data)
    │   │   ├─ If ArrayField:
    │   │   │   ├─ resolvePath(data, field.from) → array
    │   │   │   ├─ Skip if undefined & omitIfEmpty=true
    │   │   │   ├─ For each item: buildFields(children, item)  [RECURSION]
    │   │   │   └─ Wrap in <field.to> with <field.itemTag> per item
    │   │   │
    │   │   ├─ If ObjectField:
    │   │   │   ├─ resolvePath(data, field.from) → object
    │   │   │   ├─ Skip if undefined & omitIfEmpty=true
    │   │   │   └─ buildFields(children, object)  [RECURSION]
    │   │   │
    │   │   └─ If LeafField:
    │   │       ├─ If from=null: emit <field.to>staticValue</field.to>
    │   │       ├─ Else: resolvePath → value
    │   │       ├─ Skip if undefined & omitIfEmpty=true
    │   │       └─ Emit: <field.to>value</field.to> or <field.to/>
    │   │
    │   └─ Apply indentation (4 spaces per depth)
    │
Output: XML String (from .toXml())
```

## Type System

### MappingSchema

```typescript
type MappingSchema = {
  rootElement: string; // Root XML element name
  namespace?: string; // XML namespace URI
  fields: FieldMapping[]; // Top-level field mappings
};
```

### FieldMapping (Discriminated Union)

```typescript
type FieldMapping = LeafField | ObjectField | ArrayField;

// Simple value: JSON path → single XML element
type LeafField = {
  from: string | null; // JSON path (null = static only)
  to: string; // XML element name
  staticValue?: string; // Static override (from: null)
  omitIfEmpty?: boolean; // Skip tag if value undefined
  children?: never;
  array?: never;
};

// Nested object: JSON path → XML wrapper with children
type ObjectField = {
  from: string; // Required JSON path
  to: string; // XML wrapper element name
  children: FieldMapping[]; // Nested field mappings
  omitIfEmpty?: boolean; // Skip tag if undefined
  array?: never;
};

// Array: JSON array → wrapped list of items
type ArrayField = {
  from: string; // JSON path to array
  to: string; // Wrapper element name
  array: true; // Discriminator
  itemTag: string; // Per-item element name
  children: FieldMapping[]; // Field mappings for each item
  omitIfEmpty?: boolean; // Skip wrapper if array empty/undefined
};
```

### CreateMessageOptions

```typescript
type CreateMessageOptions = {
  schema: MappingSchema; // Mapping schema
  validate?: ZodSchema<unknown>; // Optional Zod validator
  strict?: boolean; // Throw on missing required fields
};
```

### Error Classes

```typescript
class SchemaError extends Error
  // Invalid schema definition
  // Examples: missing root, invalid discriminator, missing itemTag

class MappingError extends Error
  // Conversion errors
  // Examples: type mismatch, strict mode violations

class ValidationError extends Error
  // Zod validation failure
  // Examples: invalid tax ID format, date parse error
```

## Module Responsibilities

### src/core/types.ts

Type definitions and error classes for the entire system. Exports discriminated union types, option interfaces, and error constructors.

### src/core/path-resolver.ts

**Exports:** `resolvePath(obj, path)`, `resolveRequired(obj, path, strict)`

Resolves dot-notation paths (`"a.b.c"`) against nested JSON objects. Returns `undefined` for missing paths (lenient) or throws in strict mode.

```typescript
// Example: { a: { b: 42 } } + "a.b" → 42
// Split by ".", reduce through objects, return value or undefined
```

### src/core/xml-builder.ts

**Exports:** `buildXml(schema, data, opts)`

Recursively walks field mappings and builds indented XML string. Handles leaf, object, and array field types. Respects `omitIfEmpty` to skip optional tags.

### src/core/schema-validator.ts

**Exports:** `validateSchema(schema)`

Validates schema structure on first call, stores reference in WeakSet to skip validation on subsequent calls with same schema object.

### src/messages/shared-fields.ts

**Exports:** Reusable Zod validators

- `taxIdSchema` - 10-13 digits
- `isoDateSchema` - YYYY-MM-DD format
- `otherInfoSchema` - TTKhac extra fields
- `ttKhacFieldSchema` - Individual TTKhac entry

### src/messages/message-206/

Message 206 (full GDT invoice)

- **mapping-schema.ts** - Declares XML structure mapping
- **data-schema.ts** - Zod validation for message-206 data
- **index.ts** - Re-exports schema and types

Supports `messageHeader` + `invoices` array. Each level can have optional `otherInfo` (TTKhac).

### src/messages/message-200/

Message 200 (simplified invoice)

- **mapping-schema.ts** - Declares XML structure mapping
- **data-schema.ts** - Zod validation for message-200 data
- **index.ts** - Re-exports schema and types

Simplified structure with optional phone, email, bank, discount, fee, linkedInvoice fields. Quantity = 1 (locked).

### src/index.ts

Public API surface. Exports:

- `createMessage()` - Main factory function
- Re-exported types: `MappingSchema`, `FieldMapping`, `CreateMessageOptions`
- Re-exported errors: `SchemaError`, `MappingError`, `ValidationError`
- Message schemas and types: message206Schema, message200Schema, etc.

## Execution Flow Example

```typescript
// User code
const data = {
  messageHeader: { senderCode: 'V01', ... },
  data: { invoices: [{...}] }
};

// Call API
const xml = createMessage<Message206Data>(data, {
  schema: message206Schema,
  validate: message206DataSchema,  // Zod validation
  strict: true
}).toXml();

// Internal steps:
// 1. message206DataSchema.parse(data)  ← Zod validates
// 2. validateSchema(message206Schema)  ← First call: validates, memoizes
// 3. buildXml(schema, data)
//    └─ buildFields for each top-level field
//       └─ Recursively buildFields for nested structures
//       └─ Handles arrays with itemTag wrapping
// 4. Returns XML with 4-space indentation
```

## Performance Considerations

### Schema Validation Memoization

WeakSet stores validated schema references. First convert call validates deeply; subsequent calls with same schema reference skip validation.

```typescript
// Good: Schema reused
const schema = message206Schema;
convert(data1, { schema }); // Validates
convert(data2, { schema }); // Skips validation
```

### omitIfEmpty Pattern

Optional fields marked with `omitIfEmpty: true` skip XML generation when source is undefined/null, reducing output size for sparse data.

## Key Design Patterns

1. **Discriminated Union Types** - Field types enforced at compile time via discriminator fields (array, children)
2. **Schema-as-Code** - Mapping schemas are TypeScript objects, enabling IDE autocomplete and type checking
3. **Recursive Schema Walking** - Single buildField function handles leaf, object, array via recursion
4. **WeakSet Memoization** - Efficient detection of already-validated schema references
5. **Lenient Defaults** - Missing optional fields emit empty tags, unless omitIfEmpty=true
6. **Composition** - Message-specific schemas import shared validators from shared-fields.ts
