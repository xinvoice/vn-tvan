import { describe, it, expect } from 'vitest';
import { message200DataSchema } from '../../../src/messages/message-200';

// Minimal valid payload — reused across tests
const validPayload = {
  messageHeader: {
    version: '2.1.0',
    senderCode: 'V0316794479',
    receiverCode: 'TCT',
    messageType: 200 as const,
    messageId: 'MSG200001',
    messageRefId: 'MSG200001',
    taxId: '0316794479',
    quantity: 1 as const,
  },
  data: {
    invoice: {
      invoiceData: {
        generalInfo: {
          version: '2.1.0',
          invoiceName: 'HÓA ĐƠN GIÁ TRỊ GIA TĂNG',
          templateCode: '1',
          serialNumber: 'C25TXX',
          invoiceDate: '2026-03-18',
          financialLeaseFlag: 0,
          currency: 'VND',
          paymentMethod: 'TM/CK',
          solutionProviderTaxId: '0316794479',
        },
        invoiceContent: {
          seller: { name: 'Seller Co', taxId: '0316794479', address: 'Hanoi' },
          buyer: { name: 'Buyer', taxId: '0102030405', address: 'HCM' },
          items: [
            {
              nature: 1,
              lineNumber: 1,
              itemName: 'Item A',
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
    },
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

describe('message200DataSchema', () => {
  it('accepts valid minimal payload', () => {
    expect(() => message200DataSchema.parse(validPayload)).not.toThrow();
  });

  it('rejects messageType !== 200', () => {
    const result = message200DataSchema.safeParse(withOverride(['messageHeader', 'messageType'], 206));
    expect(result.success).toBe(false);
  });

  it('rejects quantity !== 1', () => {
    const result = message200DataSchema.safeParse(withOverride(['messageHeader', 'quantity'], 2));
    expect(result.success).toBe(false);
  });

  it('rejects invalid taxId (too short)', () => {
    const result = message200DataSchema.safeParse(withOverride(['messageHeader', 'taxId'], '12345'));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toMatch(/10/);
  });

  it('rejects invalid invoiceDate format', () => {
    const copy = JSON.parse(JSON.stringify(validPayload));
    copy.data.invoice.invoiceData.generalInfo.invoiceDate = '18-03-2026';
    const result = message200DataSchema.safeParse(copy);
    expect(result.success).toBe(false);
  });

  it('rejects missing required totalBeforeTax', () => {
    const copy = JSON.parse(JSON.stringify(validPayload));
    delete copy.data.invoice.invoiceData.invoiceContent.taxSummary.totalBeforeTax;
    expect(message200DataSchema.safeParse(copy).success).toBe(false);
  });

  it('rejects empty items array', () => {
    const copy = JSON.parse(JSON.stringify(validPayload));
    copy.data.invoice.invoiceData.invoiceContent.items = [];
    expect(message200DataSchema.safeParse(copy).success).toBe(false);
  });

  it('rejects otherInfo exceeding 500 chars when serialized', () => {
    const copy = JSON.parse(JSON.stringify(validPayload));
    copy.data.invoice.invoiceData.otherInfo = [{ fieldName: 'f', dataType: 'string', value: 'x'.repeat(500) }];
    expect(message200DataSchema.safeParse(copy).success).toBe(false);
  });

  it('accepts optional linkedInvoice when absent', () => {
    expect(message200DataSchema.safeParse(validPayload).success).toBe(true);
  });

  it('accepts optional qrCodeData when absent', () => {
    expect(message200DataSchema.safeParse(validPayload).success).toBe(true);
  });

  it('accepts optional taxAuthorityCode when absent', () => {
    expect(message200DataSchema.safeParse(validPayload).success).toBe(true);
  });

  it('accepts valid linkedInvoice when present', () => {
    const copy = JSON.parse(JSON.stringify(validPayload));
    copy.data.invoice.invoiceData.generalInfo.linkedInvoice = {
      type: 2,
      linkedInvoiceDate: '2026-01-01',
      notes: 'Adjustment',
    };
    expect(message200DataSchema.safeParse(copy).success).toBe(true);
  });

  it('rejects financialLeaseFlag outside 0–1 range', () => {
    const copy = JSON.parse(JSON.stringify(validPayload));
    copy.data.invoice.invoiceData.generalInfo.financialLeaseFlag = 2;
    expect(message200DataSchema.safeParse(copy).success).toBe(false);
  });
});
