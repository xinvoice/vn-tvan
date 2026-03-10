import { CreateMessageOptions } from './types';
import { validateSchema } from './schema-validator';
import { buildXml } from './xml-builder';

export { message206Schema } from './schemas/message-206';
export type { MappingSchema, FieldMapping, CreateMessageOptions } from './types';
export { SchemaError, MappingError } from './types';

/**
 * Creates a message builder from data and a mapping schema.
 * Schema is validated once (memoized). Call .toXml() to generate output.
 *
 * @param data   - Input JSON object
 * @param opts   - { schema, strict? }
 */
export function createMessage(data: unknown, opts: CreateMessageOptions) {
  validateSchema(opts.schema);
  return {
    toXml: () => buildXml(opts.schema, data, { strict: opts.strict })
  };
}
