import createAddressIndex from './address.js'
import createPoiIndex from './poi.js'
import createParcelIndex from './parcel.js'

const indexes = {
  address: createAddressIndex(),
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
