import process from 'node:process'

import validateParams from '../validate-params.js'
import search from '../api-addok-server.js'

const ADDRESS_ADDOK_SERVER_URL = process.env.ADDRESS_ADDOK_SERVER_URL || 'http://localhost:5000'

export default function createAddressIndex(query) {
  validateParams({params: query})

  return search(ADDRESS_ADDOK_SERVER_URL, query)
}
