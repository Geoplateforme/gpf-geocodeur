export default async function search(params, options = {}) {
  const {indexes} = options
  const results = await indexes.dispatchRequest(params, 'search')
  return results
}
