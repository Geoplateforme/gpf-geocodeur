import {mergeResults} from '../merge.js'

export default async function autocomplete(params, options = {}) {
  const {indexes} = options
  const limit = params.maximumResponses

  const autocompleteParams = formatAutocompleteParams(params)

  const results = await indexes.dispatchRequest({...autocompleteParams, limit}, 'autocomplete')

  return mergeResults(results, {limit}).map(resultFeature => formatResult(resultFeature))
}

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

  if (params.poiType) {
    formattedParams.category = params.poiType
  }

  formattedParams.indexes = params.type.map(v => AUTOCOMPLETE_INDEXES[v])

  if (coordinates) {
    formattedParams.lon = coordinates.lon
    formattedParams.lat = coordinates.lat
  }

  return formattedParams
}

export function computePoiCity(city) {
  if (city && Array.isArray(city) && city.length === 0) {
    return
  }

  if (city) {
    return Array.isArray(city) && city.length > 0 ? city[0] : city
  }
}

export function computeFulltext(properties) {
  const {postcode, name, street} = properties
  const city = computePoiCity(properties.city)
  let fulltext = ''

  if (name || street) {
    fulltext = name?.[0] || street

    if (postcode) {
      fulltext += city ? `, ${Array.isArray(postcode) ? postcode[0] : postcode} ${city}` : `, ${postcode}`
    } else if (city) {
      fulltext += `, ${city}`
    }
  } else if (postcode) {
    fulltext = city ? `${postcode} ${city}` : `${postcode}`
  }

  return fulltext
}

export function formatResult(resultFeature) {
  const {properties, geometry} = resultFeature

  const result = {
    x: geometry.coordinates[0],
    y: geometry.coordinates[1]
  }

  if (properties._type === 'address') {
    return {
      ...result,
      country: 'StreetAddress',
      city: properties.city,
      oldcity: properties.oldcity,
      zipcode: properties.postcode,
      street: properties.street,
      metropole: properties.citycode ? properties.citycode.slice(0, 2) < '97' : undefined,
      fulltext: computeFulltext(properties),
      classification: 7
    }
  }

  if (properties._type === 'poi') {
    return {
      ...result,
      country: 'PositionOfInterest',
      names: properties?.name,
      city: computePoiCity(properties.city),
      zipcode: properties.postcode?.[0],
      zipcodes: properties.postcode,
      metropole: properties.citycode ? properties.citycode.slice(0, 2) < '97' : undefined,
      poiType: properties.category,
      street: properties.category.includes('administratif') || properties.category.includes('commune') ? computePoiCity(properties.city) : properties.toponym,
      kind: properties.toponym,
      fulltext: computeFulltext(properties),
      classification: properties.classification
    }
  }
}
