# vn-tvan

A TypeScript library for converting JSON invoice data to XML format following Vietnam's electronic invoice standard (TVAN / GDT).

## Installation

```bash
npm install vn-tvan
```

## Usage

### Basic Example

```typescript
import { createMessage, message206Schema, Message206Data } from 'vn-tvan';

const data: Message206Data = {
  messageHeader: {
    version: '2.1.0',
    senderCode: 'V0107001729001',
    receiverCode: 'TCT',
    messageType: 206,
    messageId: 'V0107001729001F6CA05C0FAD546FCA237A8E930E7CB49',
    messageRefId: 'V0107001729001F6CA05C0FAD546FCA237A8E930E7CB49',
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
            paymentMethod: 'TM/CK',
            solutionProviderTaxId: '0101234567',
          },
          invoiceContent: {
            seller: { name: 'Công ty TNHH ABC', taxId: '0107001729', address: 'Hà Nội' },
            buyer: { name: 'Nguyễn Văn A', taxId: '0102030405', address: 'Hà Nội' },
            items: [
              {
                nature: 1,
                lineNumber: 1,
                itemName: 'Sản phẩm A',
                unit: 'Cái',
                quantity: 2,
                unitPrice: 50000,
                amount: 100000,
                taxRate: '10%',
              },
            ],
            taxSummary: {
              taxRates: [{ taxRate: '10%', amountBeforeTax: 100000, taxAmount: 10000 }],
              totalBeforeTax: 100000,
              totalTax: 10000,
              totalAmount: 110000,
              totalAmountInWords: 'Một trăm mười nghìn đồng',
            },
          },
        },
        taxAuthorityCode: 'M1-25-A1B2C-00001234567',
        qrCodeData: '000201...',
      },
    ],
  },
};

const xml = createMessage<Message206Data>(data, { schema: message206Schema }).toXml();
console.log(xml);
```

### Business-specific Extra Fields (TTKhac)

Message 206 supports an optional `otherInfo` field at multiple levels (`invoiceData`, `seller`, `buyer`, each item) for business-specific data not in the GDT standard structure. These are rendered as `<TTKhac>` in the output XML.

```typescript
invoiceData: {
  // ...generalInfo, invoiceContent...
  otherInfo: [
    { fieldName: 'MaKhachHangNoiBo', dataType: 'string', value: 'KH998877' },
    { fieldName: 'NgayHopDong',      dataType: 'date',   value: '2025-01-15' },
  ],
}
```

Each entry maps to:

```xml
<TTKhac>
  <TTin>
    <TTruong>MaKhachHangNoiBo</TTruong>
    <KDLieu>string</KDLieu>
    <DLieu>KH998877</DLieu>
  </TTin>
</TTKhac>
```

> **Constraints:** `otherInfo` is optional. When omitted, `<TTKhac>` is not rendered. Total serialized content must not exceed 500 characters (GDT requirement).

### Strict Mode

Enable strict mode to throw an error when required fields are missing:

```typescript
const xml = createMessage(data, { schema: message206Schema, strict: true }).toXml();
```

### Custom Schema

Define your own mapping schema to convert any JSON structure to XML:

```typescript
import { createMessage, MappingSchema } from 'vn-tvan';

const mySchema: MappingSchema = {
  root: 'TDiep',
  namespace: 'http://example.com/schema',
  fields: [
    { from: 'sender', to: 'MNGui' },
    { from: 'receiver', to: 'MNNhan' },
    {
      from: 'items',
      to: 'DSItems',
      array: true,
      itemTag: 'Item',
      children: [
        { from: 'name', to: 'Ten' },
        { from: 'value', to: 'GiaTri' },
      ],
    },
  ],
};

const xml = createMessage(data, { schema: mySchema }).toXml();
```

## API

### `createMessage(data, options)`

Creates a message builder from a JSON object and a mapping schema.

| Parameter        | Type            | Description                                         |
| ---------------- | --------------- | --------------------------------------------------- |
| `data`           | `unknown`       | Input JSON object                                   |
| `options.schema` | `MappingSchema` | Schema defining the JSON-to-XML mapping             |
| `options.strict` | `boolean`       | Throw on missing required fields (default: `false`) |

Returns an object with:

- `.toXml()` — generates and returns the XML string

### `MappingSchema`

| Field       | Type             | Description               |
| ----------- | ---------------- | ------------------------- |
| `root`      | `string`         | Root XML element name     |
| `namespace` | `string?`        | Optional XML namespace    |
| `fields`    | `FieldMapping[]` | Field mapping definitions |

### `FieldMapping`

Three variants:

**Leaf field** — maps a JSON path to a single XML element:

```typescript
{ from: 'json.path', to: 'XmlTag' }
{ from: null, to: 'XmlTag', value: 'static value' }
```

**Object field** — maps a JSON object to a nested XML group:

```typescript
{ from: 'json.path', to: 'XmlTag', children: [...] }
```

**Array field** — maps a JSON array to a list of XML elements:

```typescript
{ from: 'json.array', to: 'WrapperTag', array: true, itemTag: 'ItemTag', children: [...] }
```

### `OtherInfoItem`

Extra-info entry used in the optional `otherInfo` array (renders as `<TTKhac><TTin>` in XML):

| Field       | Type                                            | Description              |
| ----------- | ----------------------------------------------- | ------------------------ |
| `fieldName` | `string`                                        | Field name (`<TTruong>`) |
| `dataType`  | `'string' \| 'numeric' \| 'date' \| 'dateTime'` | Data type (`<KDLieu>`)   |
| `value`     | `string`                                        | Value (`<DLieu>`)        |

### Built-in Schemas

| Export             | Description                                         |
| ------------------ | --------------------------------------------------- |
| `message206Schema` | Vietnam GDT Message Type 206 (e-invoice submission) |

### Error Types

| Class          | Description                                            |
| -------------- | ------------------------------------------------------ |
| `SchemaError`  | Thrown when the provided schema is invalid             |
| `MappingError` | Thrown in strict mode when a required field is missing |

## Development

```bash
npm run build        # compile TypeScript
npm test             # run tests
npm run test:watch   # run tests in watch mode
npm run test:coverage # run tests with coverage
npm run format       # format source files
```

## License

MIT
