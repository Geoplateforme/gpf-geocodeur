import process from 'node:process'

import createAddressIndex from './address.js'
import createPoiIndex from './poi.js'
import createParcelIndex from './parcel.js'

const ADDRESS_ADDOK_SERVER_URL = process.env.ADDRESS_ADDOK_SERVER_URL || 'http://localhost:5000'

const indexes = {
  address: createAddressIndex(ADDRESS_ADDOK_SERVER_URL),
  poi: createPoiIndex(),
  parcel: createParcelIndex()
}

export default async function handleIndexes(params, operation) {
  const results = {}

  await Promise.all(params.indexes.map(async indexName => {
    const result = await indexes[indexName][operation](params)
    results[indexName] = result
  }))

  return results
}
