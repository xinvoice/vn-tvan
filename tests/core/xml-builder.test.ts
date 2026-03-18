import { describe, it, expect } from 'vitest';
import { buildXml } from '../../src/core/xml-builder';
import { MappingSchema, SchemaError } from '../../src/core/types';
import { validateSchema } from '../../src/core/schema-validator';

describe('buildXml — leaf fields', () => {
  const schema: MappingSchema = {
    root: 'Root',
    fields: [{ from: 'name', to: 'Ten' }],
  };

  it('renders a simple leaf field', () => {
    const result = buildXml(schema, { name: 'Alice' });
    expect(result).toContain('<Ten>Alice</Ten>');
  });

  it('renders empty element when value is missing', () => {
    const result = buildXml(schema, {});
    expect(result).toContain('<Ten/>');
  });
});

describe('buildXml — static empty element', () => {
  it('renders self-closing tag for from: null', () => {
    const schema: MappingSchema = {
      root: 'Root',
      fields: [{ from: null, to: 'MTDTChieu' }],
    };
    const result = buildXml(schema, {});
    expect(result).toContain('<MTDTChieu/>');
  });
});

describe('buildXml — array field', () => {
  it('wraps items in wrapper and item tags', () => {
    const schema: MappingSchema = {
      root: 'Root',
      fields: [
        {
          from: 'items',
          to: 'DSHHDVu',
          array: true,
          itemTag: 'HHDVu',
          children: [{ from: 'name', to: 'THHDVu' }],
        },
      ],
    };
    const result = buildXml(schema, { items: [{ name: 'Product A' }] });
    expect(result).toContain('<DSHHDVu>');
    expect(result).toContain('<HHDVu>');
    expect(result).toContain('<THHDVu>Product A</THHDVu>');
    expect(result).toContain('</HHDVu>');
    expect(result).toContain('</DSHHDVu>');
  });

  it('throws MappingError when array field receives non-array', () => {
    const schema: MappingSchema = {
      root: 'Root',
      fields: [
        {
          from: 'items',
          to: 'DSHHDVu',
          array: true,
          itemTag: 'HHDVu',
          children: [{ from: 'name', to: 'Ten' }],
        },
      ],
    };
    expect(() => buildXml(schema, { items: {} })).toThrow();
  });
});

describe('buildXml — omitIfEmpty leaf', () => {
  it('omits leaf tag when value is absent and omitIfEmpty is set', () => {
    const schema: MappingSchema = {
      root: 'Root',
      fields: [{ from: 'code', to: 'MCCQT', omitIfEmpty: true }],
    };
    const result = buildXml(schema, {});
    expect(result).not.toContain('MCCQT');
  });

  it('renders leaf tag when value is present even with omitIfEmpty', () => {
    const schema: MappingSchema = {
      root: 'Root',
      fields: [{ from: 'code', to: 'MCCQT', omitIfEmpty: true }],
    };
    const result = buildXml(schema, { code: 'ABC123' });
    expect(result).toContain('<MCCQT>ABC123</MCCQT>');
  });

  it('still emits empty tag when omitIfEmpty is NOT set (regression)', () => {
    const schema: MappingSchema = {
      root: 'Root',
      fields: [{ from: 'code', to: 'MCCQT' }],
    };
    const result = buildXml(schema, {});
    expect(result).toContain('<MCCQT/>');
  });
});

describe('buildXml — omitIfEmpty object', () => {
  it('omits wrapper when source object is absent and omitIfEmpty is set', () => {
    const schema: MappingSchema = {
      root: 'Root',
      fields: [
        {
          from: 'linkedInvoice',
          to: 'TTHDLQuan',
          omitIfEmpty: true,
          children: [{ from: 'type', to: 'TCHDon' }],
        },
      ],
    };
    const result = buildXml(schema, {});
    expect(result).not.toContain('TTHDLQuan');
  });

  it('renders wrapper when source object is present', () => {
    const schema: MappingSchema = {
      root: 'Root',
      fields: [
        {
          from: 'linkedInvoice',
          to: 'TTHDLQuan',
          omitIfEmpty: true,
          children: [{ from: 'type', to: 'TCHDon' }],
        },
      ],
    };
    const result = buildXml(schema, { linkedInvoice: { type: 1 } });
    expect(result).toContain('<TTHDLQuan>');
    expect(result).toContain('<TCHDon>1</TCHDon>');
  });

  it('still renders empty wrapper when omitIfEmpty is NOT set (regression)', () => {
    const schema: MappingSchema = {
      root: 'Root',
      fields: [
        {
          from: 'linked',
          to: 'TTHDLQuan',
          children: [{ from: 'type', to: 'TCHDon' }],
        },
      ],
    };
    const result = buildXml(schema, {});
    expect(result).toContain('<TTHDLQuan>');
  });
});

describe('validateSchema', () => {
  it('throws SchemaError when root is missing', () => {
    expect(() => validateSchema({ root: '', fields: [] })).toThrow(SchemaError);
  });

  it('throws SchemaError when array field missing itemTag', () => {
    const schema = {
      root: 'Root',
      fields: [{ from: 'items', to: 'Items', array: true, children: [] }],
    } as unknown as MappingSchema;
    expect(() => validateSchema(schema)).toThrow(SchemaError);
  });

  it('does not re-validate the same schema object twice', () => {
    const schema: MappingSchema = {
      root: 'Root',
      fields: [{ from: 'a', to: 'A' }],
    };
    validateSchema(schema);
    // second call should not throw (WeakSet memoize)
    expect(() => validateSchema(schema)).not.toThrow();
  });
});
