import process from 'node:process'

import search from '../api-addok-server.js'

const ADDRESS_ADDOK_SERVER_URL = process.env.ADDRESS_ADDOK_SERVER_URL || 'http://localhost:5000'

export default function createAddressIndex(params, operation) {
  const filters = {
    postcode: params.postcode,
    citycode: params.citycode,
    type: params.type
  }

  return search(ADDRESS_ADDOK_SERVER_URL, params, filters, operation)
}
