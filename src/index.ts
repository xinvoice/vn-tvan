import { CreateMessageOptions, ValidationError } from './types';
import { validateSchema } from './schema-validator';
import { buildXml } from './xml-builder';

export { message206Schema, message206DataSchema } from './schemas/message-206';
export type { Message206Data } from './schemas/message-206';
export { message200Schema, message200DataSchema } from './schemas/message-200';
export type { Message200Data } from './schemas/message-200';
export type { MappingSchema, FieldMapping, CreateMessageOptions } from './types';
export { SchemaError, MappingError, ValidationError } from './types';

/**
 * Creates a message builder from data and a mapping schema.
 * Schema is validated once (memoized). Call .toXml() to generate output.
 *
 * @param data   - Input JSON object
 * @param opts   - { schema, strict? }
 */
export function createMessage<T = unknown>(data: T, opts: CreateMessageOptions) {
  validateSchema(opts.schema);

  if (opts.validate) {
    const result = opts.validate.safeParse(data);
    if (!result.success) {
      const summary = result.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new ValidationError(summary, result.error.issues);
    }
  }

  return {
    toXml: () => buildXml(opts.schema, data, { strict: opts.strict }),
  };
}
