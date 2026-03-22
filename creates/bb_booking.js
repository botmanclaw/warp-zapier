const WARP_BASE = 'https://gw.wearewarp.com/api/v1'

function nextBusinessDay() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

const SERVICE_LEVELS = {
  threshold:   { label: 'Threshold',       markup: 1.0,  services: [] },
  room:        { label: 'Room of Choice',   markup: 1.15, services: ['inside-delivery'] },
  white_glove: { label: '2-Man White Glove', markup: 1.35, services: ['inside-delivery', 'liftgate-delivery'] },
}

const createBBBooking = {
  key: 'create_bb_booking',
  noun: 'Big & Bulky Booking',
  display: {
    label: 'Create Big & Bulky Booking',
    description: 'Quote and book a Warp Big & Bulky delivery with the chosen service level.',
    important: true,
  },
  operation: {
    inputFields: [
      { key: 'pickup_zipcode',   label: 'Pickup ZIP Code',    required: true,  type: 'string' },
      { key: 'delivery_zipcode', label: 'Delivery ZIP Code',  required: true,  type: 'string' },
      { key: 'pickup_date',      label: 'Pickup Date (YYYY-MM-DD)', required: false, type: 'string' },
      { key: 'weight_lbs',       label: 'Item Weight (lbs)',  required: true,  type: 'number', helpText: 'Must be ≥150 lbs or ≥96" long for Big & Bulky.' },
      { key: 'quantity',         label: 'Quantity',           required: true,  type: 'integer' },
      { key: 'length_in',        label: 'Length (inches)',    required: true,  type: 'number' },
      { key: 'width_in',         label: 'Width (inches)',     required: true,  type: 'number' },
      { key: 'height_in',        label: 'Height (inches)',    required: true,  type: 'number' },
      { key: 'commodity',        label: 'Item Name',          required: false, type: 'string' },
      {
        key: 'service_level', label: 'Service Level', required: true, type: 'string',
        choices: ['threshold', 'room', 'white_glove'],
        helpText: 'threshold = curbside/first dry area | room = room of choice | white_glove = assembly + debris removal',
      },
      { key: 'origin_street',  label: 'Origin Street',  required: true,  type: 'string' },
      { key: 'origin_city',    label: 'Origin City',    required: true,  type: 'string' },
      { key: 'origin_state',   label: 'Origin State',   required: true,  type: 'string' },
      { key: 'origin_phone',   label: 'Origin Phone',   required: true,  type: 'string' },
      { key: 'dest_street',    label: 'Dest Street',    required: true,  type: 'string' },
      { key: 'dest_city',      label: 'Dest City',      required: true,  type: 'string' },
      { key: 'dest_state',     label: 'Dest State',     required: true,  type: 'string' },
      { key: 'dest_phone',     label: 'Dest Phone',     required: true,  type: 'string' },
      { key: 'delivery_date',  label: 'Delivery Date (YYYY-MM-DD)', required: true, type: 'string' },
      { key: 'ref_num',        label: 'Reference Number', required: false, type: 'string' },
    ],
    perform: async (z, bundle) => {
      const b = bundle.inputData
      const tier = SERVICE_LEVELS[b.service_level] || SERVICE_LEVELS.threshold
      const pickupDate = b.pickup_date || nextBusinessDay()

      const item = {
        name:        b.commodity || 'Freight', packaging: 'PALLET',
        quantity:    Number(b.quantity), totalWeight: Number(b.weight_lbs), weightUnit: 'lbs',
        length:      Number(b.length_in), width: Number(b.width_in), height: Number(b.height_in),
        sizeUnit:    'IN', stackable: false,
      }

      // Step 1: Get quote with delivery services
      const quoteRes = await z.request({
        url: `${WARP_BASE}/freights/quote`,
        method: 'POST',
        headers: { apikey: bundle.authData.api_key, 'Content-Type': 'application/json' },
        body: {
          pickupDate,
          pickupInfo:   { zipcode: b.pickup_zipcode },
          deliveryInfo: { zipcode: b.delivery_zipcode },
          listItems: [item],
          ...(tier.services.length ? { deliveryServices: tier.services.map(s => ({ service: s, quantity: 1 })) } : {}),
        },
      })
      const quote = quoteRes.json
      const finalPrice = (quote.price?.amount || 0) * tier.markup

      // Step 2: Book
      const bookRes = await z.request({
        url: `${WARP_BASE}/freights/booking`,
        method: 'POST',
        headers: { apikey: bundle.authData.api_key, 'Content-Type': 'application/json' },
        body: {
          quoteId: quote.quote_id,
          pickupInfo: {
            locationName: 'Shipper', contactName: 'Shipper', contactPhone: b.origin_phone,
            address: { street: b.origin_street, city: b.origin_city, state: b.origin_state, zipcode: b.pickup_zipcode },
            windowTime: { from: `${pickupDate}T08:00:00`, to: `${pickupDate}T16:00:00` },
          },
          deliveryInfo: {
            locationName: 'Consignee', contactName: 'Consignee', contactPhone: b.dest_phone,
            address: { street: b.dest_street, city: b.dest_city, state: b.dest_state, zipcode: b.delivery_zipcode },
            windowTime: { from: `${b.delivery_date}T08:00:00`, to: `${b.delivery_date}T20:00:00` },
          },
          listItems: [item],
          ...(tier.services.length ? { deliveryServices: tier.services.map(s => ({ service: s, quantity: 1 })) } : {}),
          ...(b.ref_num ? { refNum: b.ref_num } : {}),
        },
      })

      const booking = bookRes.json
      return {
        id:              booking.shipmentNumber ?? booking.trackingNumber ?? booking.shipmentId,
        tracking_number: booking.shipmentNumber ?? booking.trackingNumber,
        shipment_id:     booking.shipmentId,
        quote_id:        quote.quote_id,
        service_level:   tier.label,
        amount:          finalPrice.toFixed(2),
        transit_days:    quote.transit_time,
        pickup_date:     pickupDate,
        delivery_date:   b.delivery_date,
      }
    },
    sample: { id: 'S-99999-2603', tracking_number: 'S-99999-2603', service_level: 'Room of Choice', amount: '425.00', transit_days: 3 },
  },
}

module.exports = createBBBooking
