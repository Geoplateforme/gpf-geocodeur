import process from 'node:process'
import got from 'got'

const {ADDRESS_ADDOK_SERVER_URL} = process.env

export default function createAddressIndex(options = {}) {
  const addokServerUrl = options.addokServerUrl || ADDRESS_ADDOK_SERVER_URL

  return {
    search(params) {
      const filters = {
        postcode: params.postcode,
        citycode: params.citycode,
        type: params.type
      }
      return executeRequest(addokServerUrl, params, filters, 'search')
    },

    reverse(params) {
      const filters = {
        postcode: params.postcode,
        citycode: params.citycode,
        type: params.type
      }
      return executeRequest(addokServerUrl, params, filters, 'reverse')
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

    return response.body
  } catch {
    throw new Error('An unexpected error has occurred')
  }
}
