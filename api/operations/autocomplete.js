import {mergeResults} from '../merge.js'
import {formatAutocompleteParams} from '../util/autocomplete.js'

export default async function autocomplete(params, options = {}) {
  const {indexes} = options
  const autocompleteParams = formatAutocompleteParams(params)

  const results = await indexes.dispatchRequest(autocompleteParams, 'autocomplete')
  return mergeResults(results, params)
}
