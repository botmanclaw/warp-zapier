const WARP_BASE = 'https://gw.wearewarp.com/api/v1'

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
      const b = bundle.inputData
      const pickupDate = b.pickup_date || nextBusinessDay()
      const weight = Math.max(Number(b.weight_lbs), Number(b.num_pallets) * 500, 10000)

      const res = await z.request({
        url: `${WARP_BASE}/freights/quote`,
        method: 'POST',
        headers: { apikey: bundle.authData.api_key, 'Content-Type': 'application/json' },
        body: {
          pickupDate,
          pickupInfo:   { zipcode: b.pickup_zipcode },
          deliveryInfo: { zipcode: b.delivery_zipcode },
          shipmentType: 'FTL',
          listItems: [{
            name:        b.commodity || 'Freight',
            packaging:   'PALLET',
            quantity:    Number(b.num_pallets),
            totalWeight: weight,
            weightUnit:  'lbs',
            length:      Number(b.length_in) || 48,
            width:       Number(b.width_in)  || 40,
            height:      Number(b.height_in) || 48,
            sizeUnit:    'IN',
            stackable:   false,
          }],
        },
      })

      const data = res.json
      return {
        id:           data.quote_id,
        quote_id:     data.quote_id,
        amount:       data.price?.amount,
        currency:     data.price?.currency_code || 'USD',
        transit_days: data.transit_time,
        expires_at:   data.expiration_time_utc,
        pickup_date:  pickupDate,
        pickup_zip:   b.pickup_zipcode,
        delivery_zip: b.delivery_zipcode,
        num_pallets:  b.num_pallets,
        weight_lbs:   weight,
      }
    },
    sample: { id: 'PRICING_ftl123', quote_id: 'PRICING_ftl123', amount: 1850.00, currency: 'USD', transit_days: 2, num_pallets: 24 },
  },
}

module.exports = createFTLRequest
