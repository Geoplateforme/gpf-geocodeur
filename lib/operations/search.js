import handleIndexes from '../indexes/index.js'

export default async function search(params) {
  const results = await handleIndexes(params, 'search')
  return results
}
