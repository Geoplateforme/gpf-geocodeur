import {mergeResults} from '../merge.js'

const AUTOCOMPLETE_INDEXES = {
  StreetAddress: 'address',
  PositionOfInterest: 'poi'
}

export default async function autocomplete(params, options = {}) {
  const {indexes} = options
  params.indexes = params.type.map(v => AUTOCOMPLETE_INDEXES[v])

  const results = await indexes.dispatchRequest(params, 'autocomplete')
  return mergeResults(results, params)
}
