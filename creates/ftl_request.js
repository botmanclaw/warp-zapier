const PROXY = 'https://warp-zapier-proxy.vercel.app'
function nextBusinessDay() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

const createFTLRequest = {
  key: 'create_ftl_request',
  noun: 'FTL Request',
  display: {
    label: 'Create FTL Request',
    description: 'Request a Warp full truckload (FTL) freight quote.',
  },
  operation: {
    inputFields: [
      { key: 'pickup_zipcode',   label: 'Pickup ZIP Code',    required: true,  type: 'string' },
      { key: 'delivery_zipcode', label: 'Delivery ZIP Code',  required: true,  type: 'string' },
      { key: 'pickup_date',      label: 'Pickup Date (YYYY-MM-DD)', required: false, type: 'string', helpText: 'Defaults to next business day.' },
      { key: 'weight_lbs',       label: 'Total Weight (lbs)', required: true,  type: 'number', helpText: 'Minimum ~10,000 lbs for FTL.' },
      { key: 'num_pallets',      label: 'Number of Pallets',  required: true,  type: 'integer' },
      { key: 'length_in',        label: 'Pallet Length (in)', required: false, type: 'number', default: '48' },
      { key: 'width_in',         label: 'Pallet Width (in)',  required: false, type: 'number', default: '40' },
      { key: 'height_in',        label: 'Pallet Height (in)', required: false, type: 'number', default: '48' },
      { key: 'commodity',        label: 'Commodity Name',     required: false, type: 'string', default: 'Freight' },
    ],
    perform: async (z, bundle) => {
      const res = await z.request({
        url: `${PROXY}/api/ftl`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-warp-token': bundle.authData.access_token },
        body: bundle.inputData,
      })
      return res.json
    },
    
    sample: { id: 'PRICING_ftl123', quote_id: 'PRICING_ftl123', amount: 1850.00, currency: 'USD', transit_days: 2, num_pallets: 24 },
  },
}

module.exports = createFTLRequest
