import { CreateMessageOptions, ValidationError } from './core/types';
import { validateSchema } from './core/schema-validator';
import { buildXml } from './core/xml-builder';

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
      const summary = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw new ValidationError(summary, result.error.issues);
    }
  }

  return {
    toXml: () => buildXml(opts.schema, data, { strict: opts.strict }),
  };
}
