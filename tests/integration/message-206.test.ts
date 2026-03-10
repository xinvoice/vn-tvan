import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createMessage, message206Schema } from '../../src/index';

const fixturesDir = join(__dirname, '../fixtures');
const jsonInput = JSON.parse(readFileSync(join(fixturesDir, 'invoice-input.json'), 'utf-8'));
const expectedXml = readFileSync(join(fixturesDir, 'invoice-expected.xml'), 'utf-8').trim();

describe('invoice206Schema — full conversion', () => {
  it('converts GDT invoice JSON to correct XML', () => {
    const result = createMessage(jsonInput, { schema: message206Schema }).toXml().trim();
    expect(result).toBe(expectedXml);
  });
});
