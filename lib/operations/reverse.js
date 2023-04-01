import handleIndexes from '../indexes/index.js'

export default async function reverse(params) {
  const results = await handleIndexes(params, 'reverse')
  return results
}
