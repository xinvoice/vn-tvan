# Codebase Summary

## Project Overview

**vn-tvan** is a TypeScript library for converting structured JSON data to Vietnam GDT e-invoice XML format (Messages 206 and 200). The library uses a schema-driven builder pattern with runtime validation to declaratively map JSON structures to XML elements.

## Architecture Overview

```
src/
├── index.ts                    # Barrel exports
├── core/
│   ├── types.ts               # Type system and error classes
│   ├── path-resolver.ts       # Dot-notation path resolution
│   ├── xml-builder.ts         # Recursive XML generation
│   └── schema-validator.ts    # Schema validation with memoization
└── messages/
    ├── shared-fields.ts       # Reusable validation schemas
    ├── message-206/           # Invoice message 206 (full GDT)
    │   ├── index.ts
    │   ├── data-schema.ts     # Zod validation schema
    │   └── mapping-schema.ts  # XML mapping definitions
    └── message-200/           # Invoice message 200 (simplified)
        ├── index.ts
        ├── data-schema.ts     # Zod validation schema
        └── mapping-schema.ts  # XML mapping definitions
```

## Public API

```typescript
// Main factory function
export function createMessage<T = unknown>(data: T, opts: CreateMessageOptions): { toXml(): string };

// Message types
export { message206Schema, message206DataSchema, Message206Data } from './messages/message-206';
export { message200Schema, message200DataSchema, Message200Data } from './messages/message-200';

// Types
export { MappingSchema, FieldMapping, CreateMessageOptions } from './core/types';
export { SchemaError, MappingError, ValidationError } from './core/types';
```

**Usage:**

```typescript
const xml = createMessage<Message206Data>(data, {
  schema: message206Schema,
  validate: message206DataSchema, // optional Zod validation
  strict: false,
}).toXml();
```

## Core Modules

| Module                  | Purpose                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| **path-resolver.ts**    | Resolves dot-notation paths (e.g., `"a.b.c"`) against JSON objects      |
| **xml-builder.ts**      | Recursive schema walker that generates indented XML                     |
| **schema-validator.ts** | Validates schema structure once per reference using WeakSet memoization |
| **shared-fields.ts**    | Reusable Zod validators: taxId, isoDate, otherInfo, ttKhacField         |

## Type System

**FieldMapping** (Discriminated Union):

- **LeafField**: `{from, to, omitIfEmpty?, staticValue?}` - JSON path → XML element
- **ObjectField**: `{from, to, children[], omitIfEmpty?}` - Nested structure → XML wrapper
- **ArrayField**: `{from, to, array: true, itemTag, children[], omitIfEmpty?}` - Array → wrapped list

**Key Types:**

- `MappingSchema`: Root element + namespace + fields array
- `CreateMessageOptions`: `{schema, validate?, strict?}`
- Error classes: `SchemaError`, `MappingError`, `ValidationError`

## Message Types

**Message 206:** Full GDT invoice with `messageHeader` + `invoices` array. Supports optional `otherInfo` (TTKhac) for business-specific fields.

**Message 200:** Simplified invoice with optional fields (phone, email, bank info, discounts). Quantity locked to 1.

## Key Patterns

1. **omitIfEmpty**: Skip XML tag when source is undefined/null
2. **TTKhac (otherInfo)**: Custom fields rendered as XML arrays at multiple levels
3. **CamelCase → Vietnamese tags**: `invoiceName` → `THDon`, `senderCode` → `MNGui`
4. **Zod Validation**: Optional runtime validation for tax ID, dates, enums
5. **Memoization**: Schema validation cached via WeakSet to avoid redundant checks

## Test Coverage

**6 test files**, 20+ tests covering:

- Path resolution and edge cases
- XML generation and formatting
- Zod validation (tax IDs, dates, enums)
- Message 200 and 206 integration
- Golden XML comparison fixtures

**Test structure:**

```
tests/
├── core/path-resolver.test.ts
├── core/xml-builder.test.ts
├── messages/message-206/data-schema.test.ts
├── messages/message-206/integration.test.ts
├── messages/message-200/data-schema.test.ts
└── messages/message-200/integration.test.ts
```

## Build & Development

**Scripts:**

- `npm run build` - Compile to JavaScript
- `npm test` - Run all tests
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - Coverage report
- `npm run format` - Prettier formatting

**Technologies:**

- TypeScript 5.9.3 (strict mode, ES2016 target)
- Zod 4.3.6 (schema validation)
- Vitest (testing)
- Prettier (formatting)
- Husky + lint-staged (pre-commit hooks)
