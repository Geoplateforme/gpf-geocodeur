import handleIndexes from '../indexes/index.js'

export default async function reverse(query) {
  const results = await handleIndexes(query, 'reverse')
  return results
}
