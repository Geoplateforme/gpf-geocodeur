import createAddokClient from './addok.js'

export default async function search(addokServerUrl, params, filters, operation) {
  const {q, limit, lon, lat} = params
  const {postcode, citycode, type} = filters

  const client = await createAddokClient(addokServerUrl, {limit, lon, lat, postcode, citycode, type}, operation)

  try {
    return await client[operation]({q, lon, lat})
  } catch {
    throw new Error('An unexpected error has occurred')
  }
}
