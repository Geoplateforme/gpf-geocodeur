import process from 'node:process'

import validateParams from '../validate-params.js'
import search from '../api-addok-server.js'

const ADDRESS_ADDOK_SERVER_URL = process.env.ADDRESS_ADDOK_SERVER_URL || 'http://localhost:5000'

export default function createAddressIndex(query, operation) {
  const params = validateParams({params: query, operation})
  const filters = {
    postcode: query.postcode,
    citycode: query.citycode,
    type: query.type
  }

  return search(ADDRESS_ADDOK_SERVER_URL, params, filters, operation)
}
