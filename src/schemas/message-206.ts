import { z } from 'zod';
import { FieldMapping, MappingSchema } from '../types';

// ---------------------------------------------------------------------------
// Zod schemas — runtime validation with deep field rules
// ---------------------------------------------------------------------------

// Reusable primitive schemas
const taxIdSchema = z.string().regex(/^\d{10,13}$/, 'Tax ID must be 10–13 digits');
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

// otherInfo: individual entry + 500-char total-array limit (GDT requirement)
const otherInfoItemSchema = z.object({
  fieldName: z.string().min(1),
  dataType: z.enum(['string', 'numeric', 'date', 'dateTime']),
  value: z.string(),
});

const otherInfoSchema = z
  .array(otherInfoItemSchema)
  .refine((items) => JSON.stringify(items).length <= 500, {
    message: 'otherInfo serialized content exceeds 500-character GDT limit',
  });

const sellerSchema = z.object({
  name: z.string().min(1),
  taxId: taxIdSchema,
  address: z.string().min(1),
  otherInfo: otherInfoSchema.optional(),
});

const buyerSchema = z.object({
  name: z.string().min(1),
  taxId: taxIdSchema,
  address: z.string().min(1),
  otherInfo: otherInfoSchema.optional(),
});

const itemSchema = z.object({
  nature: z.number().int(),
  lineNumber: z.number().int().positive(),
  itemName: z.string().min(1),
  unit: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  amount: z.number().nonnegative(),
  taxRate: z.string().min(1),
  otherInfo: otherInfoSchema.optional(),
});

const taxSummarySchema = z.object({
  taxRates: z
    .array(
      z.object({
        taxRate: z.string().min(1),
        amountBeforeTax: z.number().nonnegative(),
        taxAmount: z.number().nonnegative(),
      })
    )
    .min(1),
  totalBeforeTax: z.number().nonnegative(),
  totalTax: z.number().nonnegative(),
  totalAmount: z.number().nonnegative(),
  totalAmountInWords: z.string().min(1),
});

const generalInfoSchema = z.object({
  version: z.string().min(1),
  invoiceName: z.string().min(1),
  templateCode: z.string().min(1),
  serialNumber: z.string().min(1),
  invoiceNumber: z.number().int().positive(),
  invoiceDate: isoDateSchema,
  currency: z.string().min(1).max(3),
  paymentMethod: z.string().min(1),
  solutionProviderTaxId: taxIdSchema,
});

const invoiceDataSchema = z.object({
  generalInfo: generalInfoSchema,
  invoiceContent: z.object({
    seller: sellerSchema,
    buyer: buyerSchema,
    items: z.array(itemSchema).min(1),
    taxSummary: taxSummarySchema,
  }),
  otherInfo: otherInfoSchema.optional(),
});

const invoiceSchema = z.object({
  invoiceData: invoiceDataSchema,
  taxAuthorityCode: z.string().min(1),
  qrCodeData: z.string().min(1),
});

const messageHeaderSchema = z.object({
  version: z.string().min(1),
  senderCode: z.string().min(1),
  receiverCode: z.string().min(1),
  messageType: z.literal(206),
  messageId: z.string().min(1),
  messageRefId: z.string().min(1),
  taxId: taxIdSchema,
  quantity: z.number().int().positive(),
});

export const message206DataSchema = z.object({
  messageHeader: messageHeaderSchema,
  data: z.object({
    invoices: z.array(invoiceSchema).min(1),
  }),
});

export type OtherInfoItem = z.infer<typeof otherInfoItemSchema>;
export type Message206Data = z.infer<typeof message206DataSchema>;

// ---------------------------------------------------------------------------
// Mapping schema — JSON-to-XML field mapping for GDT message type 206
// ---------------------------------------------------------------------------

/** Reusable TTKhac ArrayField — maps otherInfo[] to <TTKhac><TTin>...</TTin></TTKhac> */
const ttKhacField: FieldMapping = {
  from: 'otherInfo',
  to: 'TTKhac',
  array: true as const,
  itemTag: 'TTin',
  children: [
    { from: 'fieldName', to: 'TTruong' },
    { from: 'dataType', to: 'KDLieu' },
    { from: 'value', to: 'DLieu' },
  ],
};

export const message206Schema: MappingSchema = {
  root: 'TDiep',
  fields: [
    {
      from: 'messageHeader',
      to: 'TTChung',
      children: [
        { from: 'version', to: 'PBan' },
        { from: 'senderCode', to: 'MNGui' },
        { from: 'receiverCode', to: 'MNNhan' },
        { from: 'messageType', to: 'MLTDiep' },
        { from: 'messageId', to: 'MTDiep' },
        { from: 'messageRefId', to: 'MTDTChieu' },
        { from: 'taxId', to: 'MST' },
        { from: 'quantity', to: 'SLuong' },
      ],
    },
    {
      from: 'data.invoices',
      to: 'DLieu',
      array: true,
      itemTag: 'HDon',
      children: [
        {
          from: 'invoiceData',
          to: 'DLHDon',
          children: [
            {
              from: 'generalInfo',
              to: 'TTChung',
              children: [
                { from: 'version', to: 'PBan' },
                { from: 'invoiceName', to: 'THDon' },
                { from: 'templateCode', to: 'KHMSHDon' },
                { from: 'serialNumber', to: 'KHHDon' },
                { from: 'invoiceNumber', to: 'SHDon' },
                { from: 'invoiceDate', to: 'NLap' },
                { from: 'currency', to: 'DVTTe' },
                { from: 'paymentMethod', to: 'HTTToan' },
                { from: 'solutionProviderTaxId', to: 'MSTTCGP' },
              ],
            },
            {
              from: 'invoiceContent',
              to: 'NDHDon',
              children: [
                {
                  from: 'seller',
                  to: 'NBan',
                  children: [
                    { from: 'name', to: 'Ten' },
                    { from: 'taxId', to: 'MST' },
                    { from: 'address', to: 'DChi' },
                    ttKhacField,
                  ],
                },
                {
                  from: 'buyer',
                  to: 'NMua',
                  children: [
                    { from: 'name', to: 'Ten' },
                    { from: 'taxId', to: 'MST' },
                    { from: 'address', to: 'DChi' },
                    ttKhacField,
                  ],
                },
                {
                  from: 'items',
                  to: 'DSHHDVu',
                  array: true,
                  itemTag: 'HHDVu',
                  children: [
                    { from: 'nature', to: 'TChat' },
                    { from: 'lineNumber', to: 'STT' },
                    { from: 'itemName', to: 'THHDVu' },
                    { from: 'unit', to: 'DVTinh' },
                    { from: 'quantity', to: 'SLuong' },
                    { from: 'unitPrice', to: 'DGia' },
                    { from: 'amount', to: 'ThTien' },
                    { from: 'taxRate', to: 'TSuat' },
                    ttKhacField,
                  ],
                },
                {
                  from: 'taxSummary',
                  to: 'TToan',
                  children: [
                    {
                      from: 'taxRates',
                      to: 'THTTLTSuat',
                      array: true,
                      itemTag: 'LTSuat',
                      children: [
                        { from: 'taxRate', to: 'TSuat' },
                        { from: 'amountBeforeTax', to: 'ThTien' },
                        { from: 'taxAmount', to: 'TThue' },
                      ],
                    },
                    { from: 'totalBeforeTax', to: 'TgTCThue' },
                    { from: 'totalTax', to: 'TgTThue' },
                    { from: 'totalAmount', to: 'TgTTTBSo' },
                    { from: 'totalAmountInWords', to: 'TgTTTBChu' },
                  ],
                },
              ],
            },
            ttKhacField, // TTKhac at DLHDon level
          ],
        },
        { from: 'taxAuthorityCode', to: 'MCCQT' },
        { from: 'qrCodeData', to: 'DLQRCode' },
      ],
    },
  ],
};
