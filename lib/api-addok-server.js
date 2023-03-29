import process from 'node:process'

import createAddokClient from './addok.js'

const ADDOK_SERVER = process.env.ADDOK_SERVER || 'http://localhost:5000'

export default async function search(args) {
  const {q, limit, lon, lat, postcode, citycode, type} = args

  const client = await createAddokClient(ADDOK_SERVER, {limit, lon, lat, postcode, citycode, type})

  try {
    return await client.search(q)
  } catch {
    throw new Error('An unexpected error has occurred')
  }
}
