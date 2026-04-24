import { MappingSchema } from '../../core/types';
import { ttKhacField } from '../shared-fields';

// ---------------------------------------------------------------------------
// Mapping schema — JSON-to-XML field mapping for GDT message type 200
// ---------------------------------------------------------------------------

export const message200Schema: MappingSchema = {
  root: 'HDon',
  fields: [
    {
      from: 'invoice.invoiceData',
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
            { from: 'invoiceNumber', to: 'SHDon', omitIfEmpty: true },
            { from: 'invoiceDate', to: 'NLap' },
            { from: 'financialLeaseFlag', to: 'HDCTTChinh' },
            { from: 'freeTradeZoneFlag', to: 'HDDCKPTQuan', omitIfEmpty: true },
            { from: 'currency', to: 'DVTTe' },
            { from: 'paymentMethod', to: 'HTTToan' },
            { from: 'solutionProviderTaxId', to: 'MSTTCGP' },
            {
              from: 'linkedInvoice',
              to: 'TTHDLQuan',
              omitIfEmpty: true,
              children: [
                { from: 'type', to: 'TCHDon' },
                { from: 'linkedType', to: 'LHDCLQuan', omitIfEmpty: true },
                { from: 'linkedTemplateCode', to: 'KHMSHDCLQuan', omitIfEmpty: true },
                { from: 'linkedSerialNumber', to: 'KHHDCLQuan', omitIfEmpty: true },
                { from: 'linkedInvoiceNumber', to: 'SHDCLQuan', omitIfEmpty: true },
                { from: 'linkedInvoiceDate', to: 'NLHDCLQuan', omitIfEmpty: true },
                { from: 'notes', to: 'GChu', omitIfEmpty: true },
              ],
            },
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
                { from: 'phone', to: 'SDThoai', omitIfEmpty: true },
                { from: 'email', to: 'DCTDTu', omitIfEmpty: true },
                { from: 'bankAccount', to: 'STKNHang', omitIfEmpty: true },
                { from: 'bankName', to: 'TNHang', omitIfEmpty: true },
                { from: 'fax', to: 'SFax', omitIfEmpty: true },
                { from: 'website', to: 'Website', omitIfEmpty: true },
                { from: 'storeCode', to: 'MaCHKD', omitIfEmpty: true },
                { from: 'storeName', to: 'TenCHKD', omitIfEmpty: true },
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
                { from: 'phone', to: 'SDThoai', omitIfEmpty: true },
                { from: 'email', to: 'DCTDTu', omitIfEmpty: true },
                { from: 'bankAccount', to: 'STKNHang', omitIfEmpty: true },
                { from: 'bankName', to: 'TNHang', omitIfEmpty: true },
                { from: 'fax', to: 'SFax', omitIfEmpty: true },
                { from: 'website', to: 'Website', omitIfEmpty: true },
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
                { from: 'itemCode', to: 'MHHDVu', omitIfEmpty: true },
                { from: 'itemName', to: 'THHDVu' },
                { from: 'unit', to: 'DVTinh', omitIfEmpty: true },
                { from: 'quantity', to: 'SLuong' },
                { from: 'unitPrice', to: 'DGia' },
                { from: 'amount', to: 'ThTien' },
                { from: 'taxRate', to: 'TSuat' },
                { from: 'discountRate', to: 'TLCKhau', omitIfEmpty: true },
                { from: 'discountAmount', to: 'STCKhau', omitIfEmpty: true },
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
                {
                  from: 'fees',
                  to: 'DSLPhi',
                  array: true,
                  itemTag: 'LPhi',
                  children: [
                    { from: 'feeName', to: 'TenPhi' },
                    { from: 'feeAmount', to: 'GTriPhi' },
                  ],
                },
                { from: 'totalCommercialDiscount', to: 'TTCKTMai', omitIfEmpty: true },
                { from: 'totalNonTaxableReduction', to: 'TGTKCThue', omitIfEmpty: true },
                { from: 'totalOtherReduction', to: 'TGTKhac', omitIfEmpty: true },
                { from: 'totalAmount', to: 'TgTTTBSo' },
                { from: 'totalAmountInWords', to: 'TgTTTBChu' },
              ],
            },
          ],
        },
        ttKhacField,
      ],
    },
    { from: 'invoice.taxAuthorityCode', to: 'MCCQT', omitIfEmpty: true },
    { from: 'invoice.qrCodeData', to: 'DLQRCode', omitIfEmpty: true },
  ],
};
