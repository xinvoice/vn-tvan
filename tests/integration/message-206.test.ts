import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createMessage, message206Schema, Message206Data } from '../../src/index';

const fixturesDir = join(__dirname, '../fixtures');
const jsonInput = JSON.parse(readFileSync(join(fixturesDir, 'invoice-input.json'), 'utf-8'));
const expectedXml = readFileSync(join(fixturesDir, 'invoice-expected.xml'), 'utf-8').trim();

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
