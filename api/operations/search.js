import {mergeResults} from '../merge.js'

export default async function search(params, options = {}) {
  const {indexes} = options
  const results = await indexes.dispatchRequest(params, 'search')

  const postFilters = []

  if (params.matchingCities) {
    postFilters.push(matchingCitiesPostFilter(params.matchingCities))
  }

  return mergeResults(results, {...params, postFilters})
}

export function matchingCitiesPostFilter(matchingCities) {
  const acceptableCitycodes = new Set(matchingCities.map(c => c.code))
  return ({properties}) => {
    let {citycode} = properties

    if (!citycode) {
      return false
    }

    if (!Array.isArray(citycode)) {
      citycode = [citycode]
    }

    return citycode.some(code => acceptableCitycodes.has(code))
  }
}
