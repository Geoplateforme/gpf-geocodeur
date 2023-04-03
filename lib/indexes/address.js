import process from 'node:process'
import got from 'got'

const ADDRESS_ADDOK_SERVER_URL = process.env.ADDRESS_ADDOK_SERVER_URL || 'http://localhost:5000'

export default function createAddressIndex() {
  return {
    search(params) {
      const filters = {
        postcode: params.postcode,
        citycode: params.citycode,
        type: params.type
      }
      return executeRequest(ADDRESS_ADDOK_SERVER_URL, params, filters, 'search')
    },

    reverse(params) {
      const filters = {
        postcode: params.postcode,
        citycode: params.citycode,
        type: params.type
      }
      return executeRequest(ADDRESS_ADDOK_SERVER_URL, params, filters, 'reverse')
    }
  }
}

async function executeRequest(addokServerUrl, params, filters, operation) {
  const {q, limit, lon, lat} = params
  const {postcode, citycode, type} = filters
  let response = {}

  const instance = got.extend({
    prefixUrl: addokServerUrl,
    responseType: 'json',
    searchParams: {postcode, citycode, type}
  })

  try {
    if (operation === 'search') {
      response = await instance.get('search', {
        searchParams: {
          q,
          limit,
          lon,
          lat
        }
      })
    } else if (operation === 'reverse') {
      response = await instance.get('reverse', {
        searchParams: {
          lat,
          lon,
          limit
        }
      })
    }

    return response
  } catch {
    throw new Error('An unexpected error has occurred')
  }
}
