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

  const client = await createAddokClient(addokServerUrl, {limit, lon, lat, postcode, citycode, type}, operation)

  try {
    return await client[operation]({q, lon, lat})
  } catch {
    throw new Error('An unexpected error has occurred')
  }
}

function sortFilters(filters, operation) {
  let sortedFilters
  const {limit, lon, lat, postcode, citycode, type} = filters

  if (operation === 'search') {
    sortedFilters = {
      limit,
      postcode,
      lon,
      lat,
      citycode,
      type
    }
  } else {
    sortedFilters = {
      limit,
      postcode,
      citycode,
      type
    }
  }

  return sortedFilters
}

async function createAddokClient(addokUrl, filters, operation) {
  const instance = got.extend({
    prefixUrl: addokUrl,
    responseType: 'json',
    searchParams: sortFilters(filters, operation)
  })

  async function search({q}) {
    const response = await instance.get('search', {
      searchParams: {
        q
      }
    })

    return response.body
  }

  async function reverse({lat, lon}) {
    const response = await instance.get('reverse', {
      searchParams: {
        lat,
        lon
      }
    })
    return response.body
  }

  return {
    search,
    reverse
  }
}
