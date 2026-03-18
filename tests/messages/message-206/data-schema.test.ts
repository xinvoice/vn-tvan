import { describe, it, expect } from 'vitest';
import { message206DataSchema } from '../../../src/messages/message-206';

// Minimal valid payload — reused across tests
const validPayload = {
  messageHeader: {
    version: '2.1.0',
    senderCode: 'V0107001729001',
    receiverCode: 'TCT',
    messageType: 206 as const,
    messageId: 'MSG001',
    messageRefId: 'MSG001',
    taxId: '0107001729',
    quantity: 1,
  },
  data: {
    invoices: [
      {
        invoiceData: {
          generalInfo: {
            version: '2.1.0',
            invoiceName: 'HÓA ĐƠN GIÁ TRỊ GIA TĂNG',
            templateCode: '1',
            serialNumber: 'C25MXX',
            invoiceNumber: 1,
            invoiceDate: '2025-03-10',
            currency: 'VND',
            paymentMethod: 'TM/CK',
            solutionProviderTaxId: '0101234567',
          },
          invoiceContent: {
            seller: { name: 'Seller Co', taxId: '0107001729', address: 'Hanoi' },
            buyer: { name: 'Buyer', taxId: '0102030405', address: 'Hanoi' },
            items: [
              {
                nature: 1,
                lineNumber: 1,
                itemName: 'Item A',
                unit: 'pcs',
                quantity: 1,
                unitPrice: 100,
                amount: 100,
                taxRate: '10%',
              },
            ],
            taxSummary: {
              taxRates: [{ taxRate: '10%', amountBeforeTax: 100, taxAmount: 10 }],
              totalBeforeTax: 100,
              totalTax: 10,
              totalAmount: 110,
              totalAmountInWords: 'One hundred ten',
            },
          },
        },
        taxAuthorityCode: 'M1-25-ABC-001',
        qrCodeData: 'qr123',
      },
    ],
  },
};

function withOverride(path: string[], value: unknown) {
  const copy = JSON.parse(JSON.stringify(validPayload)) as Record<string, unknown>;
  let node: Record<string, unknown> = copy;
  for (let i = 0; i < path.length - 1; i++) {
    node = node[path[i]] as Record<string, unknown>;
  }
  node[path[path.length - 1]] = value;
  return copy;
}

describe('message206DataSchema', () => {
  it('accepts valid payload', () => {
    expect(() => message206DataSchema.parse(validPayload)).not.toThrow();
  });

  it('rejects invalid taxId (too short)', () => {
    const result = message206DataSchema.safeParse(withOverride(['messageHeader', 'taxId'], '12345'));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/10/);
    }
  });

  it('rejects invalid taxId (non-digits)', () => {
    const result = message206DataSchema.safeParse(withOverride(['messageHeader', 'taxId'], 'ABCD123456'));
    expect(result.success).toBe(false);
  });

  it('rejects invalid invoiceDate format', () => {
    const result = message206DataSchema.safeParse(
      withOverride(
        ['data', 'invoices'],
        [
          {
            ...validPayload.data.invoices[0],
            invoiceData: {
              ...validPayload.data.invoices[0].invoiceData,
              generalInfo: {
                ...validPayload.data.invoices[0].invoiceData.generalInfo,
                invoiceDate: '10-03-2025', // wrong format
              },
            },
          },
        ],
      ),
    );
    expect(result.success).toBe(false);
  });

  it('rejects messageType !== 206', () => {
    const result = message206DataSchema.safeParse(withOverride(['messageHeader', 'messageType'], 207));
    expect(result.success).toBe(false);
  });

  it('rejects non-positive invoiceNumber', () => {
    const result = message206DataSchema.safeParse(
      withOverride(
        ['data', 'invoices'],
        [
          {
            ...validPayload.data.invoices[0],
            invoiceData: {
              ...validPayload.data.invoices[0].invoiceData,
              generalInfo: {
                ...validPayload.data.invoices[0].invoiceData.generalInfo,
                invoiceNumber: 0,
              },
            },
          },
        ],
      ),
    );
    expect(result.success).toBe(false);
  });

  it('rejects negative monetary amount', () => {
    const result = message206DataSchema.safeParse(
      withOverride(
        ['data', 'invoices'],
        [
          {
            ...validPayload.data.invoices[0],
            invoiceData: {
              ...validPayload.data.invoices[0].invoiceData,
              invoiceContent: {
                ...validPayload.data.invoices[0].invoiceData.invoiceContent,
                taxSummary: {
                  ...validPayload.data.invoices[0].invoiceData.invoiceContent.taxSummary,
                  totalAmount: -1,
                },
              },
            },
          },
        ],
      ),
    );
    expect(result.success).toBe(false);
  });

  it('rejects otherInfo array exceeding 500 characters when serialized', () => {
    const bigValue = 'x'.repeat(500);
    const result = message206DataSchema.safeParse(
      withOverride(
        ['data', 'invoices'],
        [
          {
            ...validPayload.data.invoices[0],
            invoiceData: {
              ...validPayload.data.invoices[0].invoiceData,
              otherInfo: [{ fieldName: 'field', dataType: 'string', value: bigValue }],
            },
          },
        ],
      ),
    );
    expect(result.success).toBe(false);
  });

  it('accepts otherInfo within 500 characters', () => {
    const result = message206DataSchema.safeParse(
      withOverride(
        ['data', 'invoices'],
        [
          {
            ...validPayload.data.invoices[0],
            invoiceData: {
              ...validPayload.data.invoices[0].invoiceData,
              otherInfo: [{ fieldName: 'f', dataType: 'string', value: 'v' }],
            },
          },
        ],
      ),
    );
    expect(result.success).toBe(true);
  });

  it('rejects missing required field (invoiceName)', () => {
    const copy = JSON.parse(JSON.stringify(validPayload));
    delete copy.data.invoices[0].invoiceData.generalInfo.invoiceName;
    const result = message206DataSchema.safeParse(copy);
    expect(result.success).toBe(false);
  });

  it('rejects empty invoices array', () => {
    const result = message206DataSchema.safeParse(withOverride(['data', 'invoices'], []));
    expect(result.success).toBe(false);
  });
});
