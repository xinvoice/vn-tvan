import { MappingSchema } from '../types';

export const message206Schema: MappingSchema = {
  root: 'TDiep',
  fields: [
    {
      from: 'message_header',
      to: 'TTChung',
      children: [
        { from: 'version', to: 'PBan' },
        { from: 'sender_code', to: 'MNGui' },
        { from: 'receiver_code', to: 'MNNhan' },
        { from: 'message_type', to: 'MLTDiep' },
        { from: 'message_id', to: 'MTDiep' },
        { from: 'message_ref_id', to: 'MTDTChieu' },
        { from: 'tax_id', to: 'MST' },
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
          from: 'invoice_data',
          to: 'DLHDon',
          children: [
            {
              from: 'general_info',
              to: 'TTChung',
              children: [
                { from: 'version', to: 'PBan' },
                { from: 'invoice_name', to: 'THDon' },
                { from: 'template_code', to: 'KHMSHDon' },
                { from: 'serial_number', to: 'KHHDon' },
                { from: 'invoice_number', to: 'SHDon' },
                { from: 'invoice_date', to: 'NLap' },
                { from: 'currency', to: 'DVTTe' },
                { from: 'payment_method', to: 'HTTToan' },
                { from: 'solution_provider_tax_id', to: 'MSTTCGP' },
              ],
            },
            {
              from: 'invoice_content',
              to: 'NDHDon',
              children: [
                {
                  from: 'seller',
                  to: 'NBan',
                  children: [
                    { from: 'name', to: 'Ten' },
                    { from: 'tax_id', to: 'MST' },
                    { from: 'address', to: 'DChi' },
                  ],
                },
                {
                  from: 'buyer',
                  to: 'NMua',
                  children: [
                    { from: 'name', to: 'Ten' },
                    { from: 'tax_id', to: 'MST' },
                    { from: 'address', to: 'DChi' },
                  ],
                },
                {
                  from: 'items',
                  to: 'DSHHDVu',
                  array: true,
                  itemTag: 'HHDVu',
                  children: [
                    { from: 'nature', to: 'TChat' },
                    { from: 'line_number', to: 'STT' },
                    { from: 'item_name', to: 'THHDVu' },
                    { from: 'unit', to: 'DVTinh' },
                    { from: 'quantity', to: 'SLuong' },
                    { from: 'unit_price', to: 'DGia' },
                    { from: 'amount', to: 'ThTien' },
                    { from: 'tax_rate', to: 'TSuat' },
                  ],
                },
                {
                  from: 'tax_summary',
                  to: 'TToan',
                  children: [
                    {
                      from: 'tax_rates',
                      to: 'THTTLTSuat',
                      array: true,
                      itemTag: 'LTSuat',
                      children: [
                        { from: 'tax_rate', to: 'TSuat' },
                        { from: 'amount_before_tax', to: 'ThTien' },
                        { from: 'tax_amount', to: 'TThue' },
                      ],
                    },
                    { from: 'total_before_tax', to: 'TgTCThue' },
                    { from: 'total_tax', to: 'TgTThue' },
                    { from: 'total_amount', to: 'TgTTTBSo' },
                    { from: 'total_amount_in_words', to: 'TgTTTBChu' },
                  ],
                },
              ],
            },
          ],
        },
        { from: 'tax_authority_code', to: 'MCCQT' },
        { from: 'qr_code_data', to: 'DLQRCode' },
      ],
    },
  ],
};
