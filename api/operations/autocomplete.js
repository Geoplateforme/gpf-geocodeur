import bboxPolygon from '@turf/bbox-polygon'
import booleanIntersects from '@turf/boolean-intersects'

import {mergeResults} from '../merge.js'

const MAX_LIMIT = 50

export default async function autocomplete(params, options = {}) {
  const {indexes} = options

  const autocompleteParams = formatAutocompleteParams(params)

  // Compute limit to use with underlying services
  const initialLimit = params.maximumResponses
  const enablePostFiltering = params.terr || params.bbox
  const limit = computeRetainedLimit(initialLimit, enablePostFiltering)

  const results = await indexes.dispatchRequest({...autocompleteParams, limit}, 'autocomplete')

  const postFilters = []

  if (params.terr) {
    postFilters.push(r => postFilterTerr(r, new Set(params.terr)))
  }

  if (params.bbox) {
    postFilters.push(r => postFilterBbox(r, params.bbox))
  }

  return mergeResults(results, {limit: initialLimit, postFilters})
    .map(resultFeature => formatResult(resultFeature))
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

export function computeRetainedLimit(limit, enablePostFiltering) {
  if (!enablePostFiltering) {
    return limit
  }

  return Math.min(MAX_LIMIT, 4 * limit)
}

export function postFilterTerr(result, terr) {
  const postcode = result.properties.postcode || []
  if (postcode.some(postcode => terr.has(postcode))) {
    return true
  }

  const depcode = computeDepCodeFromCityCode(result.properties.citycode)
  if (depcode.some(depcode => terr.has(depcode))) {
    return true
  }

  const territory = result.properties.territory || computeTerritoryFromDepCode(depcode)

  if (territory && terr.has(territory)) {
    return true
  }

  return false
}

export function postFilterBbox(result, bbox) {
  return booleanIntersects(result, bboxPolygon(bbox))
}

export function computeDepCodeFromCityCode(citycode) {
  return citycode
    ? [...new Set(citycode.map(code => code.slice(0, code >= '97' ? 3 : 2)))]
    : []
}

export function computeTerritoryFromDepCode(depcode) {
  if (!depcode || depcode.length === 0) {
    return
  }

  return depcode.some(d => d >= '97') ? 'DOMTOM' : 'METRO'
}
