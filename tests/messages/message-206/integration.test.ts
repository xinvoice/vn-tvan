import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  createMessage,
  message206Schema,
  message206DataSchema,
  Message206Data,
  ValidationError,
} from '../../../src/index';

const fixturesDir = join(__dirname, 'fixtures');
const jsonInput = JSON.parse(readFileSync(join(fixturesDir, 'input.json'), 'utf-8'));
const expectedXml = readFileSync(join(fixturesDir, 'expected.xml'), 'utf-8').trim();

describe('invoice206Schema — full conversion', () => {
  it('converts GDT invoice JSON to correct XML', () => {
    const result = createMessage<Message206Data>(jsonInput, { schema: message206Schema }).toXml().trim();
    expect(result).toBe(expectedXml);
  });

  it('omits TTKhac when otherInfo is absent', () => {
    const input: Message206Data = JSON.parse(JSON.stringify(jsonInput));
    delete (input.data.invoices[0].invoiceData as Record<string, unknown>).otherInfo;
    const result = createMessage<Message206Data>(input, { schema: message206Schema }).toXml();
    expect(result).not.toContain('<TTKhac>');
  });
});

describe('invoice206Schema — Zod validation', () => {
  it('produces XML when validate option is provided with valid data', () => {
    const xml = createMessage<Message206Data>(jsonInput, {
      schema: message206Schema,
      validate: message206DataSchema,
    }).toXml();
    expect(xml).toContain('<TDiep>');
  });

  it('throws ValidationError for invalid data when validate is provided', () => {
    const invalid = JSON.parse(JSON.stringify(jsonInput));
    invalid.messageHeader.taxId = 'BAD';
    expect(() => createMessage(invalid, { schema: message206Schema, validate: message206DataSchema })).toThrow(
      ValidationError,
    );
  });

  it('does not throw for invalid data when validate is absent', () => {
    const invalid = JSON.parse(JSON.stringify(jsonInput));
    invalid.messageHeader.taxId = 'BAD';
    expect(() => createMessage(invalid, { schema: message206Schema })).not.toThrow();
  });

  it('ValidationError message lists the failing field path', () => {
    const invalid = JSON.parse(JSON.stringify(jsonInput));
    invalid.messageHeader.taxId = 'BAD';
    try {
      createMessage(invalid, { schema: message206Schema, validate: message206DataSchema });
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).message).toContain('messageHeader.taxId');
    }
  });
});
