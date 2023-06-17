import {mergeResults} from '../merge.js'

export default async function reverse(params, options = {}) {
  const {indexes} = options
  const results = await indexes.dispatchRequest(params, 'reverse')
  return mergeResults(results, params)
}
