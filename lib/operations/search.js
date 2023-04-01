import handleIndexes from '../indexes/index.js'

export default async function search(query) {
  const results = await handleIndexes(query, 'search')
  return results
}
