import { FieldMapping, MappingSchema, MappingError, ConvertOptions } from './types';
import { resolvePath, resolveRequired } from './path-resolver';

const INDENT = '    '; // 4-space indent

export function buildXml(schema: MappingSchema, data: unknown, opts: ConvertOptions = {}): string {
  const ns = schema.namespace ? ` xmlns="${schema.namespace}"` : '';
  const body = buildFields(schema.fields, data, opts, 1);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${schema.root}${ns}>\n${body}</${schema.root}>`;
}

function buildFields(fields: FieldMapping[], data: unknown, opts: ConvertOptions, depth: number): string {
  return fields.map((f) => buildField(f, data, opts, depth)).join('');
}

function buildField(field: FieldMapping, data: unknown, opts: ConvertOptions, depth: number): string {
  const pad = INDENT.repeat(depth);

  // Array field: resolve array, wrap in `to`, iterate items with `itemTag`
  if (field.array) {
    const items = resolvePath(data, field.from);
    if (items === undefined || items === null) return ''; // optional array — skip
    if (!Array.isArray(items)) {
      throw new MappingError('Expected array value', field.from, field.to);
    }
    const itemLines = items
      .map((item) => {
        const children = buildFields(field.children, item, opts, depth + 2);
        return `${pad}${INDENT}<${field.itemTag}>\n${children}${pad}${INDENT}</${field.itemTag}>\n`;
      })
      .join('');
    return `${pad}<${field.to}>\n${itemLines}${pad}</${field.to}>\n`;
  }

  // Object field: resolve object, recurse into children
  if (field.children) {
    const raw = resolvePath(data, field.from);
    if (field.omitIfEmpty && (raw === undefined || raw === null)) return '';
    const nested = opts.strict ? resolveRequired(data, field.from, field.to) : raw ?? {};
    const children = buildFields(field.children, nested, opts, depth + 1);
    return `${pad}<${field.to}>\n${children}${pad}</${field.to}>\n`;
  }

  // Leaf field: static empty element (from: null) or resolved value
  if (field.from === null) {
    const val = field.value ?? '';
    return val === '' ? `${pad}<${field.to}/>\n` : `${pad}<${field.to}>${val}</${field.to}>\n`;
  }

  // Leaf field: resolved from JSON
  const value = opts.strict ? resolveRequired(data, field.from, field.to) : resolvePath(data, field.from);

  if (value === undefined || value === null) {
    if (field.omitIfEmpty) return '';
    return `${pad}<${field.to}/>\n`;
  }
  return `${pad}<${field.to}>${String(value)}</${field.to}>\n`;
}
