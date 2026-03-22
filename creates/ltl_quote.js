const PROXY = 'https://warp-zapier-proxy.vercel.app'

const createLTLQuote = {
  key: 'create_ltl_quote',
  noun: 'LTL Quote',
  display: {
    label: 'Create LTL Quote',
    description: 'Get a Warp LTL freight quote for a shipment.',
  },
  operation: {
    inputFields: [
      { key: 'pickup_zipcode',    label: 'Pickup ZIP Code',    required: true,  type: 'string' },
      { key: 'delivery_zipcode',  label: 'Delivery ZIP Code',  required: true,  type: 'string' },
      { key: 'pickup_date',       label: 'Pickup Date (YYYY-MM-DD)', required: false, type: 'string', helpText: 'Defaults to next business day.' },
      { key: 'weight_lbs',        label: 'Total Weight (lbs)', required: true,  type: 'number' },
      { key: 'quantity',          label: 'Number of Pallets',  required: true,  type: 'integer' },
      { key: 'length_in',         label: 'Length (inches)',    required: true,  type: 'number' },
      { key: 'width_in',          label: 'Width (inches)',     required: true,  type: 'number' },
      { key: 'height_in',         label: 'Height (inches)',    required: true,  type: 'number' },
      { key: 'commodity',         label: 'Commodity Name',     required: false, type: 'string', default: 'Freight' },
      { key: 'pickup_services',   label: 'Pickup Services',    required: false, type: 'string', helpText: 'Comma-separated: liftgate-pickup, inside-pickup, driver-assist' },
      { key: 'delivery_services', label: 'Delivery Services',  required: false, type: 'string', helpText: 'Comma-separated: liftgate-delivery, inside-delivery, residential-delivery' },
    ],
    perform: async (z, bundle) => {
      const res = await z.request({
        url: `${PROXY}/api/quote`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-warp-token': bundle.authData.access_token },
        body: bundle.inputData,
      })
      return res.json
    },
    sample: { id: 'PRICING_abc123', quote_id: 'PRICING_abc123', amount: 245.50, currency: 'USD', transit_days: 3, pickup_zip: '60603', delivery_zip: '90007' },
  },
}

module.exports = createLTLQuote
