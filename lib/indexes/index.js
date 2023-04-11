import createAddressIndex from './address.js'
import createPoiIndex from './poi.js'
import createParcelIndex from './parcel.js'

const INDEX_CONSTRUCTORS = {
  address: createAddressIndex,
  poi: createPoiIndex,
  parcel: createParcelIndex
}

export async function dispatchRequestToIndexes(params, operation, indexes) {
  const results = {}

  await Promise.all(params.indexes.map(async indexName => {
    if (!(indexName in indexes)) {
      throw new Error('Unsupported index type: ' + indexName)
    }

    const indexResult = await indexes[indexName][operation](params)
    results[indexName] = indexResult
  }))

  return results
}

export function createIndexes(indexes) {
  const instances = {}

  for (const indexName of indexes) {
    if (!(indexName in INDEX_CONSTRUCTORS)) {
      throw new Error('Unsupported index type: ' + indexName)
    }

    instances[indexName] = INDEX_CONSTRUCTORS[indexName]()
  }

  return {
    async dispatchRequest(params, operation) {
      return dispatchRequestToIndexes(params, operation, instances)
    }
  }
}
