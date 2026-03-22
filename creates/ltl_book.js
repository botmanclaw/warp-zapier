const PROXY = 'https://warp-zapier-proxy.vercel.app'
const bookLTLShipment = {
  key: 'book_ltl_shipment',
  noun: 'LTL Shipment',
  display: {
    label: 'Book LTL Shipment',
    description: 'Book a Warp LTL shipment using an existing quote ID.',
  },
  operation: {
    inputFields: [
      { key: 'quote_id',           label: 'Quote ID',             required: true,  type: 'string', helpText: 'Quote ID from "Create LTL Quote" step.' },
      { key: 'pickup_date',        label: 'Pickup Date (YYYY-MM-DD)', required: true, type: 'string' },
      { key: 'delivery_date',      label: 'Delivery Date (YYYY-MM-DD)', required: true, type: 'string' },
      { key: 'origin_street',      label: 'Origin Street',        required: true,  type: 'string' },
      { key: 'origin_city',        label: 'Origin City',          required: true,  type: 'string' },
      { key: 'origin_state',       label: 'Origin State',         required: true,  type: 'string' },
      { key: 'origin_zipcode',     label: 'Origin ZIP',           required: true,  type: 'string' },
      { key: 'origin_company',     label: 'Origin Company Name',  required: false, type: 'string' },
      { key: 'origin_contact',     label: 'Origin Contact Name',  required: false, type: 'string' },
      { key: 'origin_phone',       label: 'Origin Phone',         required: true,  type: 'string' },
      { key: 'origin_email',       label: 'Origin Email',         required: false, type: 'string' },
      { key: 'dest_street',        label: 'Destination Street',   required: true,  type: 'string' },
      { key: 'dest_city',          label: 'Destination City',     required: true,  type: 'string' },
      { key: 'dest_state',         label: 'Destination State',    required: true,  type: 'string' },
      { key: 'dest_zipcode',       label: 'Destination ZIP',      required: true,  type: 'string' },
      { key: 'dest_company',       label: 'Destination Company',  required: false, type: 'string' },
      { key: 'dest_contact',       label: 'Destination Contact',  required: false, type: 'string' },
      { key: 'dest_phone',         label: 'Destination Phone',    required: true,  type: 'string' },
      { key: 'dest_email',         label: 'Destination Email',    required: false, type: 'string' },
      { key: 'weight_lbs',         label: 'Total Weight (lbs)',   required: true,  type: 'number' },
      { key: 'quantity',           label: 'Number of Pallets',    required: true,  type: 'integer' },
      { key: 'length_in',          label: 'Length (inches)',      required: true,  type: 'number' },
      { key: 'width_in',           label: 'Width (inches)',       required: true,  type: 'number' },
      { key: 'height_in',          label: 'Height (inches)',      required: true,  type: 'number' },
      { key: 'commodity',          label: 'Commodity Name',       required: false, type: 'string', default: 'Freight' },
      { key: 'ref_num',            label: 'Reference Number',     required: false, type: 'string' },
    ],
    perform: async (z, bundle) => {
      const res = await z.request({
        url: `${PROXY}/api/book`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-warp-token': bundle.authData.access_token },
        body: bundle.inputData,
      })
      return res.json
    },
    
    sample: { id: 'S-12345-2603', tracking_number: 'S-12345-2603', shipment_id: 'abc123', quote_id: 'PRICING_abc123' },
  },
}

module.exports = bookLTLShipment
