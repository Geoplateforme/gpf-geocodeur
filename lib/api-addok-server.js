import process from 'node:process'

import got from 'got'

const ADDOK_SERVER = process.env.ADDOK_SERVER || 'http://localhost:5000'

export default async function search(args) {
  const {q, limit, lon, lat, postcode, citycode, type} = args
  let url = `${ADDOK_SERVER}/search/?q=${encodeURIComponent(q)}`

  if (lon && lat) {
    url += `&lon=${lon}&lat=${lat}`
  }

  if (limit) {
    url += `&limit=${limit}`
  }

  if (postcode) {
    url += `&postcode=${postcode}`
  }

  if (citycode) {
    url += `&citycode=${citycode}`
  }

  if (type) {
    url += `&type=${type}`
  }

  try {
    return await got(url).json()
  } catch {
    throw new Error('An unexpected error has occurred')
  }
}
