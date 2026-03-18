# Code Standards

## File Organization

### Naming Conventions

- **File names** use kebab-case: `path-resolver.ts`, `xml-builder.ts`
- **Directory names** use kebab-case: `message-206`, `shared-fields`
- **Long descriptive names** preferred for clarity

### Module Structure

- **core/** - Reusable engine (independent of message types)
- **messages/** - Message-type-specific implementations
- **index.ts** - Public API re-exports

## TypeScript Conventions

- **Target:** ES2016, **Module:** CommonJS, **Strict:** true
- **Type safety** required - no implicit `any`

### Type System Patterns

**Discriminated Unions** - Use for exclusive alternatives and type narrowing
**Generic Constraints** - Keep T simple: `createMessage<T = unknown>(data: T, opts)`
**Export Strategy** - Public types from `core/types.ts`, internal types stay local, message-specific types from `messages/{type}/index.ts`

### Error Handling

Define error classes: `SchemaError`, `MappingError`, `ValidationError`

```typescript
class SchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaError';
  }
}
```

## Code Organization

- **File size:** Target under 200 lines; refactor if exceeded
- **Function organization:** Types → Constants → Helpers → Exports
- **Imports:** Group by (external, then internal), sort alphabetically

## Validation & Testing

### Zod Schemas

Define close to use; shared validators in `shared-fields.ts`

```typescript
const taxIdSchema = z.string().regex(/^\d{10,13}$/, 'Invalid tax ID');
```

### Test Structure

- Colocate tests in `tests/` mirroring `src/` structure
- Use `.test.ts` suffix
- Fixture-based integration tests with JSON input/expected XML

## Formatting & Linting

### Prettier

- Print width: 100, trailing comma: es5, semicolons: true, single quote: false

### Code Quality

- No `console.log` in production code
- No commented-out blocks
- Self-documenting names preferred over comments

## JSDoc & Comments

**JSDoc** for public exports with @param, @returns, @throws

```typescript
/**
 * Converts JSON to XML using schema.
 * @throws {SchemaError} If schema invalid
 */
export function createMessage<T = unknown>(data: T, opts: CreateMessageOptions);
```

**Inline comments** for complex logic and non-obvious decisions

## Dependencies

- **zod** ^4.3.6 - Schema validation
- **TypeScript** ^5.9.3 - Compilation
- **Vitest** ^4.0.18 - Testing (dev only)

Use caret ranges for stability, minimize transitive dependencies.
