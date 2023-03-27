import filterIndexes from '../filter-indexes.js'

import address from './address.js'
import poi from './poi.js'
import parcel from './parcel.js'

const components = {
  address,
  poi,
  parcel
}

export default function handleIndexes(query) {
  const {index} = query
  const indexes = filterIndexes(index)

  const results = {}

  for (const indexName of indexes) {
    const component = components[indexName]
    const componentResult = component(query)
    results[indexName] = componentResult
  }

  return results
}
