const PROXY = 'https://warp-zapier-proxy.vercel.app'

const getShipmentStatus = {
  key: 'get_shipment_status',
  noun: 'Shipment',
  display: {
    label: 'Get Shipment Status',
    description: 'Fetch current status for a Warp shipment.',
  },
  operation: {
    inputFields: [
      { key: 'tracking_number', label: 'Tracking Number', required: true, type: 'string' },
    ],
    perform: async (z, bundle) => {
      const res = await z.request({
        url: `${PROXY}/api/status`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-warp-token': bundle.authData.access_token },
        body: { tracking_number: bundle.inputData.tracking_number },
      })
      return [res.json]
    },
    sample: { id: 'S-12345-2603', tracking_number: 'S-12345-2603', status: 'in_transit' },
  },
}

module.exports = getShipmentStatus
