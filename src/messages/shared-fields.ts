import { z } from 'zod';
import { FieldMapping } from '../core/types';

// ---------------------------------------------------------------------------
// Shared Zod primitives — reused across message types
// ---------------------------------------------------------------------------

export const taxIdSchema = z.string().regex(/^\d{10,13}$/, 'Tax ID must be 10–13 digits');
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const otherInfoItemSchema = z.object({
  fieldName: z.string().min(1),
  dataType: z.enum(['string', 'numeric', 'date', 'dateTime']),
  value: z.string(),
});

export const otherInfoSchema = z.array(otherInfoItemSchema).refine((items) => JSON.stringify(items).length <= 500, {
  message: 'otherInfo serialized content exceeds 500-character GDT limit',
});

// ---------------------------------------------------------------------------
// Shared mapping field — maps otherInfo[] to <TTKhac><TTin>...</TTin></TTKhac>
// ---------------------------------------------------------------------------

export const ttKhacField: FieldMapping = {
  from: 'otherInfo',
  to: 'TTKhac',
  array: true as const,
  itemTag: 'TTin',
  children: [
    { from: 'fieldName', to: 'TTruong' },
    { from: 'dataType', to: 'KDLieu' },
    { from: 'value', to: 'DLieu' },
  ],
};
