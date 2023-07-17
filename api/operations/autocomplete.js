import {omit} from 'lodash-es'

import {mergeResults} from '../merge.js'

export default async function autocomplete(params, options = {}) {
  const {indexes} = options
  const autocompleteParams = formatAutocompleteParams(params)

  const results = await indexes.dispatchRequest(autocompleteParams, 'autocomplete')

  const formattedResult = formatResult(results)
  const mergedResults = mergeResults(formattedResult, autocompleteParams)

  return mergedResults.map(result => (omit({...result.properties}, ['_type', 'score'])))
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
  formattedParams.limit = params.maximumResponses

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
  let fulltext = properties.name
  const {postcode, city} = properties

  if (postcode) {
    fulltext += city ? `, ${postcode} ${city}` : `, ${postcode}`
  } else if (city) {
    fulltext += `, ${city}`
  }

  return fulltext
}

export function formatResult(result) {
  const autocompleteResult = {}

  for (const r of Object.keys(result)) {
    if (r === 'address') {
      autocompleteResult.address = result[r].map(feature => ({properties: {
        country: 'StreetAddress',
        city: feature.properties.city,
        oldcity: feature.properties.oldcity,
        zipcode: feature.properties.postcode,
        street: feature.properties.street,
        metropole: feature.properties.citycode ? feature.properties.citycode.slice(0, 2) < '97' : undefined,
        fulltext: computeFulltext(feature.properties),
        x: feature.geometry.coordinates[0],
        y: feature.geometry.coordinates[1],
        classification: 7,
        score: feature.properties.score
      }}))
    } else if (r === 'poi') {
      autocompleteResult.poi = result[r].map(feature => ({properties: {
        country: 'PositionOfInterest',
        names: feature.properties.name,
        city: feature.properties.city,
        zipcode: feature.properties.postcode?.[0],
        zipcodes: feature.properties.postcode,
        metropole: feature.properties.citycode ? feature.properties.citycode.slice(0, 2) < '97' : undefined,
        poiType: feature.properties.category,
        street: feature.properties.category.includes('administratif') || feature.properties.category.includes('commune') ? feature.properties.city : feature.properties.toponym,
        kind: feature.properties.toponym,
        fulltext: computeFulltext(feature.properties),
        x: feature.geometry.coordinates[0],
        y: feature.geometry.coordinates[1],
        classification: feature.properties.classification,
        score: feature.properties.score
      }}))
    }
  }

  return autocompleteResult
}
