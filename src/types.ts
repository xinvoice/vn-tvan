import type { ZodType } from 'zod';

/** Options passed to convert() */
export type ConvertOptions = {
  strict?: boolean; // throw on missing required fields (default: false)
};

/** Leaf field: maps a JSON path to a single XML element */
type LeafField = {
  from: string | null; // JSON path (null = static/empty element)
  to: string; // XML element name
  value?: string; // static value override (used when from: null)
  children?: never;
  array?: never;
};

/** Object field: maps a JSON path to a nested XML element group */
type ObjectField = {
  from: string;
  to: string;
  children: FieldMapping[];
  array?: never;
};

/** Array field: maps a JSON array to a wrapped list of XML elements */
type ArrayField = {
  from: string;
  to: string; // wrapper tag, e.g. "DSHHDVu"
  array: true;
  itemTag: string; // per-item tag, e.g. "HHDVu"
  children: FieldMapping[];
};

/** Discriminated union — TypeScript enforces correct shape per type */
export type FieldMapping = LeafField | ObjectField | ArrayField;

/** Top-level schema definition */
export type MappingSchema = {
  root: string;
  namespace?: string;
  fields: FieldMapping[];
};

/** Options for createMessage() */
export type CreateMessageOptions = {
  schema: MappingSchema;
  strict?: boolean;
  /** Optional Zod schema for runtime data validation before XML build */
  validate?: ZodType;
};

/** Custom error types */
export class SchemaError extends Error {
  constructor(message: string) {
    super(`[SchemaError] ${message}`);
    this.name = 'SchemaError';
  }
}

export class MappingError extends Error {
  constructor(message: string, public readonly path: string, public readonly xmlTarget: string) {
    super(`[MappingError] <${xmlTarget}> ${message} (source: "${path}")`);
    this.name = 'MappingError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly issues: unknown[]) {
    super(`[ValidationError] ${message}`);
    this.name = 'ValidationError';
  }
}
