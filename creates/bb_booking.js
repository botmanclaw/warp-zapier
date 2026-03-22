const PROXY = 'https://warp-zapier-proxy.vercel.app'
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
      const res = await z.request({
        url: `${PROXY}/api/bb`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-warp-token': bundle.authData.access_token },
        body: bundle.inputData,
      })
      return res.json
    },
    
    sample: { id: 'S-99999-2603', tracking_number: 'S-99999-2603', service_level: 'Room of Choice', amount: '425.00', transit_days: 3 },
  },
}

module.exports = createBBBooking
