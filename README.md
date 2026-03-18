# vn-tvan

TypeScript library for converting JSON invoice data to XML for Vietnam TVAN / GDT message formats.

## Installation

```bash
npm install vn-tvan
```

## Basic Usage

Use a built-in schema, pass invoice data, then call `.toXml()`.

```typescript
import { createMessage, message206Schema, type Message206Data } from 'vn-tvan';

const data: Message206Data = {
  messageHeader: {
    version: '2.1.0',
    senderCode: 'V0107001729001',
    receiverCode: 'TCT',
    messageType: 206,
    messageId: 'YOUR_MESSAGE_ID',
    messageRefId: 'YOUR_REFERENCE_ID',
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
            invoiceNumber: 12345,
            invoiceDate: '2025-03-10',
            currency: 'VND',
          },
          invoiceContent: {
            seller: { name: 'Seller name', taxId: '0107001729', address: 'Hà Nội' },
            buyer: { name: 'Buyer name', taxId: '0102030405', address: 'Hà Nội' },
            items: [
              {
                itemName: 'Product',
                unit: 'Cái',
                quantity: 1,
                unitPrice: 100000,
                amount: 100000,
                taxRate: '10%',
              },
            ],
            taxSummary: {
              taxRates: [{ taxRate: '10%', amountBeforeTax: 100000, taxAmount: 10000 }],
              totalBeforeTax: 100000,
              totalTax: 10000,
              totalAmount: 110000,
            },
          },
        },
      },
    ],
  },
};

const xml = createMessage(data, { schema: message206Schema }).toXml();
```

Available built-in exports:

- `message206Schema` with `Message206Data`
- `message200Schema` with `Message200Data`

Optional features supported by `createMessage`:

- `strict: true` to fail on missing required mapped fields
- `validate: message206DataSchema` or `message200DataSchema` for Zod validation

## License

MIT
