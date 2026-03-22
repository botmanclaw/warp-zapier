const WARP_BASE = 'https://gw.wearewarp.com/api/v1'

const getShipmentStatus = {
  key: 'get_shipment_status',
  noun: 'Shipment',
  display: {
    label: 'Get Shipment Status',
    description: 'Fetch current status and tracking events for a Warp shipment.',
  },
  operation: {
    inputFields: [
      { key: 'tracking_number', label: 'Tracking Number', required: true, type: 'string', helpText: 'Warp tracking number (e.g. S-12345-2603).' },
    ],
    perform: async (z, bundle) => {
      const res = await z.request({
        url: `${WARP_BASE}/freights/tracking`,
        method: 'POST',
        headers: { apikey: bundle.authData.api_key, 'Content-Type': 'application/json' },
        body: { trackingNumbers: [bundle.inputData.tracking_number] },
      })
      const data = res.json
      const shipment = Array.isArray(data) ? data[0] : (data.shipments?.[0] ?? data)
      return [{
        id:              bundle.inputData.tracking_number,
        tracking_number: bundle.inputData.tracking_number,
        status:          shipment?.status ?? shipment?.shipmentStatus ?? 'unknown',
        pickup_date:     shipment?.pickupDate,
        delivery_date:   shipment?.deliveryDate,
        carrier:         shipment?.carrier ?? shipment?.carrierName,
        origin_zip:      shipment?.pickupInfo?.zipcode,
        dest_zip:        shipment?.deliveryInfo?.zipcode,
      }]
    },
    sample: { id: 'S-12345-2603', tracking_number: 'S-12345-2603', status: 'in_transit', carrier: 'Warp' },
  },
}

module.exports = getShipmentStatus
