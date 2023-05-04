import createError from 'http-errors'
import {hint} from '@mapbox/geojsonhint'

import {extractSingleParams, isFirstCharValid, isDepartmentcodeValid} from '../util/params.js'
import {normalizeQuery} from '../util/querystring.js'
import {validateCoordinatesValue} from '../util/coordinates.js'
import {poiCategories} from '../poi-categories.js'

const ERR_PREFIX = 'Error: Parameter [searchgeom]'

const ERR_MSGS = {
  notValidCircle: 'Not valid Circle geometry: coordinates must have 2 elements (lon, lat)',
  missingType: 'Geometry object must have a \'type\' property',
  invalidType: 'Geometry type not allowed',
  missingCoordinates: 'Not valid geometry: property \'coordinates\' missing',
  missingRadius: 'Not valid Circle geometry: property \'radius\' missing',
  invalidRadius: 'Not valid Circle geometry: \'radius\' must be a number'
}

export function validateSearchgeom(searchgeom) {
  let errors = []

  if (!Object.hasOwn(searchgeom, 'type')) {
    throw new Error(`${ERR_PREFIX} ${ERR_MSGS.missingType}`)
  }

  const validGeometries = new Set([
    'Point',
    'LineString',
    'Polygon',
    'Circle'
  ])

  if (!validGeometries.has(searchgeom.type)) {
    throw new Error(`${ERR_PREFIX} ${ERR_MSGS.invalidType} '${searchgeom.type}'`)
  }

  if (!Object.hasOwn(searchgeom, 'coordinates')) {
    throw new Error(`${ERR_PREFIX} ${ERR_MSGS.missingCoordinates} ${searchgeom.type}`)
  }

  if (searchgeom.type === 'Circle') {
    if (!Object.hasOwn(searchgeom, 'radius')) {
      throw new Error(`${ERR_PREFIX} ${ERR_MSGS.missingRadius}`)
    }

    if (typeof searchgeom.radius !== 'number') {
      throw new TypeError(`${ERR_PREFIX} ${ERR_MSGS.invalidRadius}`)
    }
  }

  if (searchgeom.type.toLowerCase() === 'circle') {
    if (searchgeom.coordinates.length !== 2) {
      throw new Error(`${ERR_PREFIX} ${ERR_MSGS.notValidCircle}`)
    }

    validateCoordinatesValue(searchgeom.coordinates)
  } else {
    errors = hint(searchgeom)
  }

  if (errors.length > 0) {
    throw new Error(`${ERR_PREFIX} ${errors[0].message}`)
  }
}

export const PARAMS = {
  indexes: {
    nameInQuery: 'index',
    type: 'string',
    array: true,
    required: false,
    allowedValues: ['address', 'poi', 'parcel'],
    defaultValue: ['address']
  },

  searchgeom: {
    type: 'object',
    validate(v) {
      validateSearchgeom(v)
    }
  },

  q: {
    type: 'string',
    validate(v) {
      if (v.length < 3 || v.length > 200 || !isFirstCharValid(v)) {
        throw new Error('must contain between 3 and 200 chars and start with a number or a letter')
      }
    }
  },

  limit: {
    type: 'integer',
    defaultValue: 5,
    validate(v) {
      if (v < 1 || v > 20) {
        throw new Error('Param limit must be an integer between 1 and 20')
      }
    }
  },

  lon: {
    type: 'float',
    validate(v) {
      if (v < -180 || v > 180) {
        throw new Error('lon must be a float between -180 and 180')
      }
    }
  },

  lat: {
    type: 'float',
    validate(v) {
      if (v < -90 || v > 90) {
        throw new Error('lat must be a float between -90 and 90')
      }
    }
  },

  type: {
    type: 'string',
    allowedValues: ['housenumber', 'street', 'locality', 'municipality']
  },

  postcode: {
    type: 'string',
    validate(v) {
      if (!/^\d{5}$/.test(v)) {
        throw new Error('Param postcode must contain 5 digits')
      }
    }
  },

  citycode: {
    type: 'string',
    validate(v) {
      if (!/^(\d{5}|\d[AB]\d{3})$/.test(v)) {
        throw new Error('Param citycode is invalid')
      }
    }
  },

  city: {
    type: 'string',
    validate(v) {
      if (v.length > 50) {
        throw new Error('must contain between 1 and 50 chars')
      }
    }
  },

  category: {
    type: 'string',
    allowedValues: poiCategories,
    array: true
  },

  returntruegeometry: {
    type: 'boolean',
    defaultValue: false
  },

  departmentcode: {
    type: 'string',
    validate(v) {
      if (!isDepartmentcodeValid(v)) {
        throw new Error('Param departmentcode is invalid')
      }
    }
  },

  municipalitycode: {
    type: 'string',
    validate(v) {
      if (!/^\d{2,3}$/.test(v)) {
        throw new Error('Param municipalitycode is invalid')
      }
    }
  },

  oldmunicipalitycode: {
    type: 'string',
    validate(v) {
      if (!/^\d{3}$/.test(v)) {
        throw new Error('Param oldmunicipalitycode is invalid')
      }
    }
  },

  districtcode: {
    type: 'string',
    validate(v) {
      if (!/^\d{3}$/.test(v)) {
        throw new Error('Param districtcode is invalid')
      }
    }
  },

  section: {
    type: 'string',
    validate(v) {
      if (!/^(\d{1,2}|[A-Z]{1,2}|0?[A-Z])$/.test(v)) {
        throw new Error('Param section is invalid')
      }
    }
  },

  number: {
    type: 'string',
    validate(v) {
      if (!/^\d{1,4}$/.test(v)) {
        throw new Error('Param number is invalid')
      }
    }
  },

  sheet: {
    type: 'string',
    validate(v) {
      if (!/^\d{1,2}$/.test(v)) {
        throw new Error('Param sheet is invalid')
      }
    }
  }
}

export function extractParams(query, {operation}) {
  const parsedParams = extractSingleParams(normalizeQuery(query), PARAMS)

  const hasLat = 'lat' in parsedParams
  const hasLon = 'lon' in parsedParams

  if ((hasLat && !hasLon) || (hasLon && !hasLat)) {
    throw createError(400, 'Failed parsing query', {detail: ['lon/lat must be present together if defined']})
  }

  const parcelOnly = parsedParams.indexes.length === 1 && parsedParams.indexes[0] === 'parcel'
  const addressOnly = parsedParams.indexes.length === 1 && parsedParams.indexes[0] === 'address'

  if (operation === 'search' && !parcelOnly && !('q' in parsedParams)) {
    throw createError(400, 'Failed parsing query', {detail: ['q is a required param']})
  }

  if (operation === 'reverse' && addressOnly && 'searchgeom' in parsedParams && !['Polygon', 'Circle'].includes(parsedParams.searchgeom.type)) {
    throw createError(400, 'Failed parsing query', {detail: [`Error: Parameter [searchgeom] Geometry type '${parsedParams.searchgeom.type}' not allowed for index(es) 'address'`]})
  }

  return parsedParams
}
