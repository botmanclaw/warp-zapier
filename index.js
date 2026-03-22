const { version: platformVersion } = require('zapier-platform-core')
const packageJson = require('./package.json')

const authentication   = require('./authentication')
const createLTLQuote   = require('./creates/ltl_quote')
const bookLTLShipment  = require('./creates/ltl_book')
const createFTLRequest = require('./creates/ftl_request')
const createBBBooking  = require('./creates/bb_booking')
const getShipmentStatus = require('./searches/shipment_status')

const App = {
  version:    packageJson.version,
  platformVersion,
  authentication,

  beforeRequest: [
    (request, z, bundle) => {
      if (bundle.authData.api_key) {
        request.headers = request.headers || {}
        request.headers.apikey = bundle.authData.api_key
      }
      return request
    },
  ],

  creates: {
    [createLTLQuote.key]:   createLTLQuote,
    [bookLTLShipment.key]:  bookLTLShipment,
    [createFTLRequest.key]: createFTLRequest,
    [createBBBooking.key]:  createBBBooking,
  },

  searches: {
    [getShipmentStatus.key]: getShipmentStatus,
  },

  triggers: {},
}

module.exports = App
