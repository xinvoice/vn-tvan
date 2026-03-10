import { FieldMapping, MappingSchema, SchemaError } from './types';

// Memoize validated schemas — only validate once per schema object reference
const validatedSchemas = new WeakSet<MappingSchema>();

export function validateSchema(schema: MappingSchema): void {
  if (validatedSchemas.has(schema)) return;

  if (!schema.root?.trim()) {
    throw new SchemaError('root element name is required');
  }
  if (!Array.isArray(schema.fields) || schema.fields.length === 0) {
    throw new SchemaError('schema.fields must be a non-empty array');
  }

  validateFields(schema.fields, 'root');
  validatedSchemas.add(schema);
}

function validateFields(fields: FieldMapping[], parentPath: string): void {
  for (const field of fields) {
    const loc = `${parentPath} > ${field.to}`;

    if (!field.to?.trim()) {
      throw new SchemaError(`${loc}: "to" (XML element name) is required`);
    }

    if (field.array) {
      // ArrayField — itemTag required
      if (!field.itemTag?.trim()) {
        throw new SchemaError(`${loc}: "itemTag" is required when array: true`);
      }
      if (!Array.isArray(field.children) || field.children.length === 0) {
        throw new SchemaError(`${loc}: array fields must have at least one child mapping`);
      }
      validateFields(field.children, loc);
    } else if (field.children) {
      // ObjectField — must have a source path
      if (!field.from) {
        throw new SchemaError(`${loc}: object fields with children require a "from" path`);
      }
      validateFields(field.children, loc);
    }
    // LeafField — no extra validation needed (from: null is valid for empty elements)
  }
}
