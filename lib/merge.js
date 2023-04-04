import {chain} from 'lodash-es'

export function mergeResults(indexesResults, params) {
  const indexesWithResults = Object.keys(indexesResults)
    .filter(k => indexesResults[k].length > 0)

  if (indexesWithResults.length === 0) {
    return []
  }

  if (indexesWithResults.length === 1) {
    return indexesResults[indexesWithResults[0]]
  }

  return chain(indexesResults)
    .mapValues((results, indexName) => results.map(r => ({
      ...r,
      properties: {
        ...r.properties,
        _type: indexName
      }
    })))
    .map(r => r)
    .flatten()
    .sortBy(r => -r.properties.score)
    .take(params.limit)
    .value()
}
