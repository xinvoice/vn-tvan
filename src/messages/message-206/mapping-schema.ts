import { MappingSchema } from '../../core/types';
import { ttKhacField } from '../shared-fields';

// ---------------------------------------------------------------------------
// Mapping schema — JSON-to-XML field mapping for GDT message type 206
// ---------------------------------------------------------------------------

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
