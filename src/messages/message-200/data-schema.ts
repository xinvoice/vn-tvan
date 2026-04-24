import { z } from 'zod';
import { taxIdSchema, isoDateSchema, otherInfoSchema } from '../shared-fields';

// ---------------------------------------------------------------------------
// TD200-specific Zod schemas
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
      }),
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
  freeTradeZoneFlag: z.number().int().min(0).max(1).optional(),
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

export const message200DataSchema = z.object({
  invoice: invoiceSchema,
});

export type Message200Data = z.infer<typeof message200DataSchema>;
