# vn-tvan

A TypeScript library for converting JSON invoice data to XML format following Vietnam's electronic invoice standard (TVAN / GDT).

## Installation

```bash
npm install vn-tvan
```

## Usage

### Basic Example

```typescript
import { createMessage, message206Schema } from 'vn-tvan';

const data = {
  message_header: {
    version: '2.1.0',
    sender_code: 'V0107001729001',
    receiver_code: 'TCT',
    message_type: 206,
    message_id: 'V0107001729001F6CA05C0FAD546FCA237A8E930E7CB49',
    message_ref_id: 'V0107001729001F6CA05C0FAD546FCA237A8E930E7CB49',
    tax_id: '0107001729',
    quantity: 1,
  },
  data: {
    invoices: [
      {
        invoice_data: {
          general_info: {
            version: '2.1.0',
            invoice_name: 'HÓA ĐƠN GIÁ TRỊ GIA TĂNG',
            template_code: '1',
            serial_number: 'C25MXX',
            invoice_number: 12345,
            invoice_date: '2025-03-10',
            currency: 'VND',
            payment_method: 'TM/CK',
            solution_provider_tax_id: '0101234567',
          },
          invoice_content: {
            seller: {
              name: 'Công ty TNHH Giải Pháp Công Nghệ',
              tax_id: '0107001729',
              address: 'Số 15, Phố Đặng Thùy Trâm, Hà Nội',
            },
            buyer: {
              name: 'Nguyễn Văn A',
              tax_id: '0102030405',
              address: 'Quận Cầu Giấy, Hà Nội',
            },
            items: [
              {
                nature: 1,
                line_number: 1,
                item_name: 'Sản phẩm A',
                unit: 'Cái',
                quantity: 2,
                unit_price: 50000,
                amount: 100000,
                tax_rate: '10%',
              },
            ],
            tax_summary: {
              tax_rates: [{ tax_rate: '10%', amount_before_tax: 100000, tax_amount: 10000 }],
              total_before_tax: 100000,
              total_tax: 10000,
              total_amount: 110000,
              total_amount_in_words: 'Một trăm mười nghìn đồng',
            },
          },
        },
        tax_authority_code: 'MCCQT123',
        qr_code_data: 'QR_DATA',
      },
    ],
  },
};

const xml = createMessage(data, { schema: message206Schema }).toXml();
console.log(xml);
```

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
