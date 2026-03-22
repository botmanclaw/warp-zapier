const PROXY = 'https://warp-zapier-proxy.vercel.app'

const authentication = {
  type: 'custom',
  fields: [
    {
      key: 'access_token',
      label: 'Warp Access Token',
      required: true,
      type: 'string',
      helpText: 'Your Warp integration token. Get one at https://warp-zapier-proxy.vercel.app/connect',
    },
  ],
  test: {
    url: `${PROXY}/api/auth/test-token`,
    method: 'GET',
    headers: { 'x-warp-token': '{{bundle.authData.access_token}}' },
  },
  connectionLabel: (z, bundle) => `Warp (${bundle.authData.access_token.slice(0, 12)}…)`,
}

module.exports = authentication
