import {chain} from 'lodash-es'

export function mergeResults(indexesResults, params) {
  let results = chain(indexesResults)
    .mapValues((results, indexName) => results.map(r => ({
      ...r,
      properties: {
        ...r.properties,
        _type: indexName
      }
    })))
    .map(r => r)
    .flatten()

  const postFilters = params.postFilters || []

  for (const postFilter of postFilters) {
    results = results.filter(r => postFilter(r))
  }

  return results.sortBy(r => -r.properties.score).take(params.limit).value()
}
