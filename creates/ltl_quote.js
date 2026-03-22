const WARP_BASE = 'https://gw.wearewarp.com/api/v1'

function nextBusinessDay() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

const createLTLQuote = {
  key: 'create_ltl_quote',
  noun: 'LTL Quote',
  display: {
    label: 'Create LTL Quote',
    description: 'Get a Warp LTL freight quote for a shipment.',
    important: true,
  },
  operation: {
    inputFields: [
      { key: 'pickup_zipcode',   label: 'Pickup ZIP Code',   required: true,  type: 'string' },
      { key: 'delivery_zipcode', label: 'Delivery ZIP Code', required: true,  type: 'string' },
      { key: 'pickup_date',      label: 'Pickup Date (YYYY-MM-DD)', required: false, type: 'string', helpText: 'Defaults to next business day.' },
      { key: 'weight_lbs',       label: 'Total Weight (lbs)', required: true, type: 'number' },
      { key: 'quantity',         label: 'Number of Pallets',  required: true, type: 'integer' },
      { key: 'length_in',        label: 'Length (inches)',    required: true, type: 'number' },
      { key: 'width_in',         label: 'Width (inches)',     required: true, type: 'number' },
      { key: 'height_in',        label: 'Height (inches)',    required: true, type: 'number' },
      { key: 'commodity',        label: 'Commodity Name',     required: false, type: 'string', default: 'Freight' },
      { key: 'residential',      label: 'Residential Delivery?', required: false, type: 'boolean' },
      {
        key: 'pickup_services', label: 'Pickup Services', required: false, type: 'string',
        helpText: 'Comma-separated. Options: liftgate-pickup, inside-pickup, driver-assist',
      },
      {
        key: 'delivery_services', label: 'Delivery Services', required: false, type: 'string',
        helpText: 'Comma-separated. Options: liftgate-delivery, inside-delivery, residential-delivery, driver-assist',
      },
    ],
    perform: async (z, bundle) => {
      const pickupDate = bundle.inputData.pickup_date || nextBusinessDay()
      const pickupServices  = (bundle.inputData.pickup_services  || '').split(',').map(s => s.trim()).filter(Boolean)
      const deliveryServices = (bundle.inputData.delivery_services || '').split(',').map(s => s.trim()).filter(Boolean)

      const body = {
        pickupDate,
        pickupInfo:   { zipcode: bundle.inputData.pickup_zipcode },
        deliveryInfo: { zipcode: bundle.inputData.delivery_zipcode },
        shipmentType: 'LTL',
        listItems: [{
          name:        bundle.inputData.commodity || 'Freight',
          packaging:   'PALLET',
          quantity:    Number(bundle.inputData.quantity),
          totalWeight: Number(bundle.inputData.weight_lbs),
          weightUnit:  'lbs',
          length:      Number(bundle.inputData.length_in),
          width:       Number(bundle.inputData.width_in),
          height:      Number(bundle.inputData.height_in),
          sizeUnit:    'IN',
          stackable:   false,
        }],
        ...(pickupServices.length   ? { pickupServices:   pickupServices.map(s => ({ service: s, quantity: 1 })) }   : {}),
        ...(deliveryServices.length ? { deliveryServices: deliveryServices.map(s => ({ service: s, quantity: 1 })) } : {}),
      }

      const res = await z.request({
        url: `${WARP_BASE}/freights/quote`,
        method: 'POST',
        headers: { apikey: bundle.authData.api_key, 'Content-Type': 'application/json' },
        body,
      })

      const data = res.json
      return {
        quote_id:     data.quote_id,
        amount:       data.price?.amount,
        currency:     data.price?.currency_code || 'USD',
        transit_days: data.transit_time,
        expires_at:   data.expiration_time_utc,
        status:       data.status,
        pickup_date:  pickupDate,
        pickup_zip:   bundle.inputData.pickup_zipcode,
        delivery_zip: bundle.inputData.delivery_zipcode,
        id:           data.quote_id,
      }
    },
    sample: { id: 'PRICING_abc123', quote_id: 'PRICING_abc123', amount: 245.50, currency: 'USD', transit_days: 3, pickup_zip: '60603', delivery_zip: '90007' },
  },
}

module.exports = createLTLQuote
