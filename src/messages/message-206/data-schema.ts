import { z } from 'zod';
import { taxIdSchema, isoDateSchema, otherInfoSchema, otherInfoItemSchema } from '../shared-fields';

// ---------------------------------------------------------------------------
// TD206-specific Zod schemas
// ---------------------------------------------------------------------------

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
      }),
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
