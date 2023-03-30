import got from 'got'

function sortFilters(filters, operation) {
  let sortedFilters
  const {limit, lon, lat, postcode, citycode, type} = filters

  if (operation === 'geocode') {
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

export default async function createAddokClient(addokUrl, filters, operation) {
  const instance = got.extend({
    prefixUrl: addokUrl,
    responseType: 'json',
    searchParams: sortFilters(filters, operation)
  })

  async function geocode({q}) {
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
    geocode,
    reverse
  }
}
