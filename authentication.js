const authentication = {
  type: 'custom',
  fields: [
    {
      key: 'api_key',
      label: 'Warp API Key',
      required: true,
      type: 'string',
      helpText: 'Your Warp API key. Request one from api-support@wearewarp.com.',
    },
  ],
  test: {
    url: 'https://gw.wearewarp.com/api/v1/freights/quote-history',
    method: 'GET',
    headers: { apikey: '{{bundle.authData.api_key}}' },
  },
  connectionLabel: (z, bundle) => `Warp API (${bundle.authData.api_key.slice(0, 8)}…)`,
}

module.exports = authentication
