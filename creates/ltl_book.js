const WARP_BASE = 'https://gw.wearewarp.com/api/v1'

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
      const b = bundle.inputData
      const body = {
        quoteId: b.quote_id,
        pickupInfo: {
          locationName: b.origin_company || 'Shipper',
          contactName:  b.origin_contact || 'Shipper',
          contactPhone: b.origin_phone,
          contactEmail: b.origin_email || undefined,
          address: { street: b.origin_street, city: b.origin_city, state: b.origin_state, zipcode: b.origin_zipcode },
          windowTime: { from: `${b.pickup_date}T08:00:00`, to: `${b.pickup_date}T16:00:00` },
        },
        deliveryInfo: {
          locationName: b.dest_company || b.dest_contact || 'Consignee',
          contactName:  b.dest_contact || 'Consignee',
          contactPhone: b.dest_phone,
          contactEmail: b.dest_email || undefined,
          address: { street: b.dest_street, city: b.dest_city, state: b.dest_state, zipcode: b.dest_zipcode },
          windowTime: { from: `${b.delivery_date}T08:00:00`, to: `${b.delivery_date}T20:00:00` },
        },
        listItems: [{
          name: b.commodity || 'Freight', packaging: 'PALLET',
          quantity: Number(b.quantity), totalWeight: Number(b.weight_lbs), weightUnit: 'lbs',
          length: Number(b.length_in), width: Number(b.width_in), height: Number(b.height_in),
          sizeUnit: 'IN', stackable: false,
        }],
        ...(b.ref_num ? { refNum: b.ref_num } : {}),
      }

      const res = await z.request({
        url: `${WARP_BASE}/freights/booking`,
        method: 'POST',
        headers: { apikey: bundle.authData.api_key, 'Content-Type': 'application/json' },
        body,
      })

      const data = res.json
      return {
        id:               data.shipmentNumber ?? data.trackingNumber ?? data.shipmentId,
        tracking_number:  data.shipmentNumber ?? data.trackingNumber,
        shipment_id:      data.shipmentId,
        quote_id:         b.quote_id,
        pickup_date:      b.pickup_date,
        origin_zip:       b.origin_zipcode,
        dest_zip:         b.dest_zipcode,
      }
    },
    sample: { id: 'S-12345-2603', tracking_number: 'S-12345-2603', shipment_id: 'abc123', quote_id: 'PRICING_abc123' },
  },
}

module.exports = bookLTLShipment
