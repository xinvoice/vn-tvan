import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  createMessage,
  message200Schema,
  message200DataSchema,
  Message200Data,
  ValidationError,
} from '../../../src/index';

const fixturesDir = join(__dirname, 'fixtures');
const minimalInput = JSON.parse(readFileSync(join(fixturesDir, 'minimal-input.json'), 'utf-8'));
const minimalExpected = readFileSync(join(fixturesDir, 'minimal-expected.xml'), 'utf-8').trim();
const fullInput = JSON.parse(readFileSync(join(fixturesDir, 'full-input.json'), 'utf-8'));
const fullExpected = readFileSync(join(fixturesDir, 'full-expected.xml'), 'utf-8').trim();

describe('message200Schema — minimal conversion', () => {
  it('converts minimal TD200 JSON to correct XML', () => {
    const result = createMessage<Message200Data>(minimalInput, { schema: message200Schema }).toXml().trim();
    expect(result).toBe(minimalExpected);
  });

  it('omits MCCQT when taxAuthorityCode is absent', () => {
    const result = createMessage<Message200Data>(minimalInput, { schema: message200Schema }).toXml();
    expect(result).not.toContain('MCCQT');
  });

  it('omits TTHDLQuan when linkedInvoice is absent', () => {
    const result = createMessage<Message200Data>(minimalInput, { schema: message200Schema }).toXml();
    expect(result).not.toContain('TTHDLQuan');
  });

  it('omits DLQRCode when qrCodeData is absent', () => {
    const result = createMessage<Message200Data>(minimalInput, { schema: message200Schema }).toXml();
    expect(result).not.toContain('DLQRCode');
  });

  it('omits DSLPhi when fees are absent', () => {
    const result = createMessage<Message200Data>(minimalInput, { schema: message200Schema }).toXml();
    expect(result).not.toContain('DSLPhi');
  });
});

describe('message200Schema — full conversion', () => {
  it('converts full TD200 JSON to correct XML', () => {
    const result = createMessage<Message200Data>(fullInput, { schema: message200Schema }).toXml().trim();
    expect(result).toBe(fullExpected);
  });

  it('includes MCCQT when taxAuthorityCode is present', () => {
    const result = createMessage<Message200Data>(fullInput, { schema: message200Schema }).toXml();
    expect(result).toContain('<MCCQT>CQT-2026-ABC-0001234567890123</MCCQT>');
  });

  it('includes TTHDLQuan when linkedInvoice is present', () => {
    const result = createMessage<Message200Data>(fullInput, { schema: message200Schema }).toXml();
    expect(result).toContain('<TTHDLQuan>');
    expect(result).toContain('<TCHDon>2</TCHDon>');
  });

  it('includes DSLPhi when fees are present', () => {
    const result = createMessage<Message200Data>(fullInput, { schema: message200Schema }).toXml();
    expect(result).toContain('<DSLPhi>');
    expect(result).toContain('<TenPhi>Phí vận chuyển</TenPhi>');
  });

  it('includes DLQRCode when qrCodeData is present', () => {
    const result = createMessage<Message200Data>(fullInput, { schema: message200Schema }).toXml();
    expect(result).toContain('<DLQRCode>qr-data-string</DLQRCode>');
  });

  it('omits TTKhac when otherInfo is absent', () => {
    const input: Message200Data = JSON.parse(JSON.stringify(minimalInput));
    const result = createMessage<Message200Data>(input, { schema: message200Schema }).toXml();
    expect(result).not.toContain('<TTKhac>');
  });

  it('includes TTKhac when otherInfo is present', () => {
    const result = createMessage<Message200Data>(fullInput, { schema: message200Schema }).toXml();
    expect(result).toContain('<TTKhac>');
    expect(result).toContain('<TTruong>CheckingCode</TTruong>');
  });
});

describe('message200Schema — Zod validation', () => {
  it('produces XML when validate option is provided with valid data', () => {
    const xml = createMessage<Message200Data>(minimalInput, {
      schema: message200Schema,
      validate: message200DataSchema,
    }).toXml();
    expect(xml).toContain('<TDiep>');
  });

  it('throws ValidationError when messageType is not 200', () => {
    const invalid = JSON.parse(JSON.stringify(minimalInput));
    invalid.messageHeader.messageType = 206;
    expect(() => createMessage(invalid, { schema: message200Schema, validate: message200DataSchema })).toThrow(
      ValidationError,
    );
  });

  it('ValidationError message lists the failing field path', () => {
    const invalid = JSON.parse(JSON.stringify(minimalInput));
    invalid.messageHeader.taxId = 'BAD';
    try {
      createMessage(invalid, { schema: message200Schema, validate: message200DataSchema });
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).message).toContain('messageHeader.taxId');
    }
  });
});
