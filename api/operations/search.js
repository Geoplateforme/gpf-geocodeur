import {mergeResults} from '../merge.js'

export default async function search(params, options = {}) {
  const {indexes} = options
  const results = await indexes.dispatchRequest(params, 'search')

  const postFilters = []

  if (params.matchingCities) {
    const acceptableCitycodes = new Set(params.matchingCities.map(c => c.code))
    postFilters.push(
      r => r.properties.citycode && r.properties.citycode.some(code => acceptableCitycodes.has(code))
    )
  }

  return mergeResults(results, params)
}
