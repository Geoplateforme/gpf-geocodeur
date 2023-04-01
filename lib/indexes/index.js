import address from './address.js'
import poi from './poi.js'
import parcel from './parcel.js'

const components = {
  address,
  poi,
  parcel
}

export default async function handleIndexes(params, operation) {
  const results = {}

  for await (const indexName of params.indexes) {
    const component = components[indexName]
    const componentResult = await component(params, operation)
    results[indexName] = componentResult
  }

  return results
}
