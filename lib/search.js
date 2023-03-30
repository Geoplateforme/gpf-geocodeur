import handleIndexes from './indexes/index.js'

export default async function search(query, reverse) {
  const operation = reverse ? 'reverse' : 'geocode'
  const results = await handleIndexes(query, operation)

  return results
}
