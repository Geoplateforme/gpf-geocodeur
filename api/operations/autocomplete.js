import {omit} from 'lodash-es'

import {mergeResults} from '../merge.js'
import {formatAutocompleteParams, formatResult} from '../util/autocomplete.js'

export default async function autocomplete(params, options = {}) {
  const {indexes} = options
  const autocompleteParams = formatAutocompleteParams(params)

  const results = await indexes.dispatchRequest(autocompleteParams, 'autocomplete')

  const formattedResult = formatResult(results)
  const mergedResults = mergeResults(formattedResult, autocompleteParams)

  return mergedResults.map(m => omit(m, ['score', 'properties']))
}
