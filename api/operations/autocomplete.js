import {omit} from 'lodash-es'

import {isDepartmentcodeValid} from '../util/params.js'
import {mergeResults} from '../merge.js'
import {getDepartements} from '../../lib/cog.js'

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

  formattedParams.indexes = params.type.map(v => AUTOCOMPLETE_INDEXES[v])
  formattedParams.limit = params.maximumResponses

  if (coordinates) {
    formattedParams.lon = coordinates.lon
    formattedParams.lat = coordinates.lat
  }

  return formattedParams
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
        metropole: feature.properties.citycode.slice(0, 2) < '97',
        fulltext: `${feature.properties.name}, ${feature.properties.postcode} ${feature.properties.city}`,
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
        zipcode: feature.properties.postcode[0],
        zipcodes: feature.properties.postcode,
        metropole: feature.properties.citycode.slice(0, 2) < '97',
        poiType: feature.properties.category,
        street: feature.properties.category.includes('administratif') || feature.properties.category.includes('commune') ? feature.properties.city : feature.properties.toponym,
        kind: feature.properties.toponym,
        fulltext: `${feature.properties.name}, ${feature.properties.postcode}${feature.properties.city ? ` ${feature.properties.city}` : ''}`,
        x: feature.geometry.coordinates[0],
        y: feature.geometry.coordinates[1],
        classification: feature.properties.classification,
        score: feature.properties.score
      }}))
    }
  }

  return autocompleteResult
}

export function getDepartementsList() {
  const departements = getDepartements()
  const metropole = []
  const domtom = []

  for (const departement of departements) {
    const {code} = departement

    if (code >= '971' && code <= '978') {
      domtom.push(code)
    } else if (code.length === 2) {
      metropole.push(code)
    }
  }

  return {
    metropole,
    domtom
  }
}

export function getTerrCodes(params) {
  if (!params.terr) {
    return
  }

  const uniqueTerr = new Set(params.terr)
  const terrCodes = {
    departmentcodes: [],
    postcodes: []
  }
  const departementsList = getDepartementsList()

  if (uniqueTerr.has('METROPOLE')) {
    terrCodes.departmentcodes.push(...departementsList.metropole)
  } else {
    const otherDepartements = [...uniqueTerr].filter(v => v.length === 2)

    for (const code of otherDepartements) {
      if (isDepartmentcodeValid(code)) {
        terrCodes.departmentcodes.push(code)
      }
    }
  }

  if (uniqueTerr.has('DOMTOM')) {
    terrCodes.departmentcodes.push(...departementsList.domtom)
  } else {
    const otherDepartements = [...uniqueTerr].filter(v => v.length === 3)

    for (const code of otherDepartements) {
      if (isDepartmentcodeValid(code)) {
        terrCodes.departmentcodes.push(code)
      }
    }
  }

  const postcodes = [...uniqueTerr].filter(v => v.length === 5)

  for (const postcode of postcodes) {
    if (postcode.slice(0, 2) !== '97' && !terrCodes.departmentcodes.includes(postcode.slice(0, 2))) {
      terrCodes.postcodes.push(postcode)
    }

    if ((postcode.slice(0, 3) >= '971' && postcode.slice(0, 3) <= '978') && !terrCodes.departmentcodes.includes(postcode.slice(0, 3))) {
      terrCodes.postcodes.push(postcode)
    }
  }

  return terrCodes
}
