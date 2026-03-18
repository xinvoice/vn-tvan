import { z } from 'zod';

// ---------------------------------------------------------------------------
// Reusable primitives (copied from message-206 — no shared module yet)
// ---------------------------------------------------------------------------

const taxIdSchema = z.string().regex(/^\d{10,13}$/, 'Tax ID must be 10–13 digits');
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

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

// ---------------------------------------------------------------------------
// TD200-specific schemas
// ---------------------------------------------------------------------------

const linkedInvoiceSchema = z.object({
  type: z.number().int(),
  linkedType: z.number().int().optional(),
  linkedTemplateCode: z.string().optional(),
  linkedSerialNumber: z.string().optional(),
  linkedInvoiceNumber: z.number().int().positive().optional(),
  linkedInvoiceDate: isoDateSchema.optional(),
  notes: z.string().optional(),
});

const feeItemSchema = z.object({
  feeName: z.string().min(1),
  feeAmount: z.number().nonnegative(),
});

const sellerSchema = z.object({
  name: z.string().min(1),
  taxId: taxIdSchema,
  address: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().optional(),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
  fax: z.string().optional(),
  website: z.string().optional(),
  storeCode: z.string().optional(),
  storeName: z.string().optional(),
  otherInfo: otherInfoSchema.optional(),
});

const buyerSchema = z.object({
  name: z.string().min(1),
  taxId: taxIdSchema,
  address: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().optional(),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
  fax: z.string().optional(),
  website: z.string().optional(),
  otherInfo: otherInfoSchema.optional(),
});

const itemSchema = z.object({
  nature: z.number().int(),
  lineNumber: z.number().int().positive(),
  itemCode: z.string().optional(),
  itemName: z.string().min(1),
  unit: z.string().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  amount: z.number().nonnegative(),
  taxRate: z.string().min(1),
  discountRate: z.number().optional(),
  discountAmount: z.number().optional(),
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
  fees: z.array(feeItemSchema).optional(),
  totalCommercialDiscount: z.number().optional(),
  totalNonTaxableReduction: z.number().optional(),
  totalOtherReduction: z.number().optional(),
});

const generalInfoSchema = z.object({
  version: z.string().min(1),
  invoiceName: z.string().min(1),
  templateCode: z.string().min(1),
  serialNumber: z.string().min(1),
  invoiceNumber: z.number().int().positive().optional(),
  invoiceDate: isoDateSchema,
  financialLeaseFlag: z.number().int().min(0).max(1),
  currency: z.string().min(1).max(3),
  paymentMethod: z.string().min(1),
  solutionProviderTaxId: taxIdSchema,
  linkedInvoice: linkedInvoiceSchema.optional(),
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
  taxAuthorityCode: z.string().min(1).optional(),
  invoiceData: invoiceDataSchema,
  qrCodeData: z.string().min(1).optional(),
});

const messageHeaderSchema = z.object({
  version: z.string().min(1),
  senderCode: z.string().min(1),
  receiverCode: z.string().min(1),
  messageType: z.literal(200),
  messageId: z.string().min(1),
  messageRefId: z.string().min(1),
  taxId: taxIdSchema,
  quantity: z.literal(1),
});

export const message200DataSchema = z.object({
  messageHeader: messageHeaderSchema,
  data: z.object({
    invoice: invoiceSchema,
  }),
});

export type Message200Data = z.infer<typeof message200DataSchema>;
