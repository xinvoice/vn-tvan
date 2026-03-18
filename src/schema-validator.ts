import { z } from 'zod';
import { MappingSchema, SchemaError } from './types';

// Memoize validated schemas — only validate once per schema object reference
const validatedSchemas = new WeakSet<MappingSchema>();

// Recursive field mapping schema via z.lazy() — handles arbitrarily nested children
const fieldMappingSchema: z.ZodType = z.lazy(() =>
  z
    .object({
      from: z.union([z.string(), z.null()]),
      to: z.string().min(1, '"to" (XML element name) is required'),
      value: z.string().optional(),
      array: z.literal(true).optional(),
      itemTag: z.string().optional(),
      children: z.array(fieldMappingSchema).optional(),
    })
    .superRefine((field, ctx) => {
      if (field.array) {
        if (!field.itemTag?.trim()) {
          ctx.addIssue({ code: 'custom', message: '"itemTag" is required when array: true' });
        }
        if (!field.children?.length) {
          ctx.addIssue({ code: 'custom', message: 'array fields must have at least one child mapping' });
        }
      } else if (field.children?.length) {
        if (!field.from) {
          ctx.addIssue({ code: 'custom', message: 'object fields with children require a "from" path' });
        }
      }
    })
);

const mappingSchemaValidator = z.object({
  root: z.string().min(1, 'root element name is required'),
  namespace: z.string().optional(),
  fields: z.array(fieldMappingSchema).min(1, 'schema.fields must be a non-empty array'),
});

export function validateSchema(schema: MappingSchema): void {
  if (validatedSchemas.has(schema)) return;

  const result = mappingSchemaValidator.safeParse(schema);
  if (!result.success) {
    throw new SchemaError(result.error.issues[0].message);
  }

  validatedSchemas.add(schema);
}
