import createAddokClient from './addok.js'

export default async function search(addokServerUrl, args) {
  const {q, limit, lon, lat, postcode, citycode, type} = args

  const client = await createAddokClient(addokServerUrl, {limit, lon, lat, postcode, citycode, type})

  try {
    return await client.search(q)
  } catch {
    throw new Error('An unexpected error has occurred')
  }
}
