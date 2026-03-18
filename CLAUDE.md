# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build          # Compile TypeScript → dist/
npm run test           # Run all tests once (vitest)
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
npm run format         # Format src/ and tests/ with prettier
```

Run a single test file:
```bash
npx vitest run tests/core/xml-builder.test.ts
```

## Architecture

This is a TypeScript library (`commonjs`, output to `dist/`) that converts JSON invoice data to XML for Vietnam TVAN / GDT message formats.

### Core pipeline

```
createMessage(data, { schema, strict?, validate? })
  → validateSchema(schema)         // src/core/schema-validator.ts
  → validate?.safeParse(data)      // optional Zod runtime check
  → .toXml() → buildXml(schema, data)  // src/core/xml-builder.ts
```

### Key abstractions (`src/core/types.ts`)

- **`MappingSchema`** — top-level descriptor: `{ root, namespace?, fields[] }`
- **`FieldMapping`** — discriminated union of three shapes:
  - `LeafField` — maps a JSON path to a single XML element
  - `ObjectField` — maps a JSON path to a nested XML group (has `children`)
  - `ArrayField` — maps a JSON array to a wrapped list (has `array: true`, `itemTag`, `children`)
- **`createMessage()`** — entry point in `src/create-message.ts`; returns `{ toXml() }`

### Message schemas (`src/messages/`)

Each message type (`message-200`, `message-206`) has:
- `data-schema.ts` — Zod schema + TypeScript types for the input data
- `mapping-schema.ts` — `MappingSchema` definition (JSON path → XML element mapping)
- `index.ts` — re-exports both

### Adding a new message type

1. Create `src/messages/message-XXX/` with `data-schema.ts`, `mapping-schema.ts`, `index.ts`
2. Export from `src/index.ts`
3. Add tests under `tests/messages/message-XXX/`

### Shared fields

Common XML field mappings live in `src/messages/shared-fields.ts` and are composed into message schemas.

### Error types

`SchemaError`, `MappingError`, `ValidationError` — all exported from `src/core/types.ts`.
