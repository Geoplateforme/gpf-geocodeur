const AUTOCOMPLETE_INDEXES = {
  StreetAddress: 'address',
  PositionOfInterest: 'poi'
}

export function getCenterFromCoordinates(params) {
  const {bbox, lonlat} = params

  if (!lonlat && !bbox) {
    return
  }

  if (lonlat) {
    return {
      lon: lonlat[0],
      lat: lonlat[1]
    }
  }

  if (bbox) {
    return {
      lon: (bbox[0] / 2) + (bbox[2] / 2),
      lat: (bbox[1] / 2) + (bbox[3] / 2)
    }
  }
}

export function formatAutocompleteParams(params) {
  const coordinates = getCenterFromCoordinates(params)

  const formattedParams = {
    q: params.text,
    autocomplete: true
  }

  formattedParams.indexes = params.type.map(v => AUTOCOMPLETE_INDEXES[v])
  formattedParams.limit = params.maximumResponses

  if (coordinates) {
    formattedParams.lon = coordinates[0]
    formattedParams.lat = coordinates[1]
  }

  return formattedParams
}

export function formatResult(result) {
  const autocompleteResult = {}

  for (const r of Object.keys(result)) {
    if (r === 'address') {
      autocompleteResult.address = result[r].map(({properties}) => ({
        country: 'StreetAddress',
        city: properties.city,
        zipcode: properties.postcode,
        street: properties.street,
        metropole: properties.citycode.slice(0, 2) !== '97',
        fulltext: `${properties.name}, ${properties.postcode} ${properties.city}`,
        x: properties.x,
        y: properties.y,
        score: properties.score
      }))
    } else if (r === 'poi') {
      autocompleteResult.poi = result[r].map(({properties}) => ({
        country: 'PositionOfInterest',
        names: properties.name,
        city: properties.city,
        zipcode: properties.postcode[0],
        zipcodes: properties.postcode,
        metropole: properties.citycode.slice(0, 2) !== '97',
        poiType: properties.category,
        street: properties.category.includes('administratif') || properties.category.includes('commune') ? properties.city : properties.toponym,
        kind: properties.toponym,
        fulltext: `${properties.name}, ${properties.postcode} ${properties.city}`,
        score: properties.score
      }))
    }
  }

  return autocompleteResult
}
