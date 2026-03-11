import { FieldMapping, MappingSchema } from '../types';

/** A single extra-info entry inside <TTKhac>/<TTin> */
export type OtherInfoItem = {
  fieldName: string; // <TTruong> — field name
  dataType: 'string' | 'numeric' | 'date' | 'dateTime'; // <KDLieu> — string | numeric | date | dateTime
  value: string; // <DLieu>  — actual value
};

export type Message206Data = {
  messageHeader: {
    version: string;
    senderCode: string;
    receiverCode: string;
    messageType: number;
    messageId: string;
    messageRefId: string;
    taxId: string;
    quantity: number;
  };
  data: {
    invoices: Array<{
      invoiceData: {
        generalInfo: {
          version: string;
          invoiceName: string;
          templateCode: string;
          serialNumber: string;
          invoiceNumber: number;
          invoiceDate: string;
          currency: string;
          paymentMethod: string;
          solutionProviderTaxId: string;
        };
        invoiceContent: {
          seller: { name: string; taxId: string; address: string; otherInfo?: OtherInfoItem[] };
          buyer: { name: string; taxId: string; address: string; otherInfo?: OtherInfoItem[] };
          items: Array<{
            nature: number;
            lineNumber: number;
            itemName: string;
            unit: string;
            quantity: number;
            unitPrice: number;
            amount: number;
            taxRate: string;
            otherInfo?: OtherInfoItem[];
          }>;
          taxSummary: {
            taxRates: Array<{
              taxRate: string;
              amountBeforeTax: number;
              taxAmount: number;
            }>;
            totalBeforeTax: number;
            totalTax: number;
            totalAmount: number;
            totalAmountInWords: string;
          };
        };
        /** Optional business-specific extra fields at invoice level (<TTKhac> inside <DLHDon>) */
        otherInfo?: OtherInfoItem[];
      };
      taxAuthorityCode: string;
      qrCodeData: string;
    }>;
  };
};

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
