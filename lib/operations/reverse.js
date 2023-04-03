export default async function reverse(params, options = {}) {
  const {indexes} = options
  const results = await indexes.dispatchRequest(params, 'reverse')
  return results
}
