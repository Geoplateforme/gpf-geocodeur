import createError from 'http-errors'
import {hint} from '@mapbox/geojsonhint'

import {extractSingleParams, isFirstCharValid, isDepartmentcodeValid} from '../util/params.js'
import {normalizeQuery} from '../util/querystring.js'
import {validateCoordinatesValue} from '../util/coordinates.js'
import {poiCategories} from '../poi-categories.js'

export function validateSearchgeom(searchgeom) {
  if (!Object.hasOwn(searchgeom, 'type')) {
    throw new Error('Geometry object must have a \'type\' property')
  }

  const allowedGeometryTypes = new Set([
    'Point',
    'LineString',
    'Polygon',
    'Circle'
  ])

  if (!allowedGeometryTypes.has(searchgeom.type)) {
    throw new Error(`Geometry type not allowed: ${searchgeom.type}`)
  }

  if (searchgeom.type === 'Circle') {
    if (!('radius' in searchgeom)) {
      throw new Error('Geometry not valid: radius property is missing')
    }

    const {radius} = searchgeom

    if (typeof radius !== 'number' || Number.isNaN(radius) || radius <= 0 || radius > 1000) {
      throw new TypeError('Geometry not valid: circle radius must be a float between 0 and 1000')
    }

    try {
      validateCoordinatesValue(searchgeom.coordinates)
    } catch (error) {
      throw new Error(`Geometry not valid: ${error.message}`)
    }
  } else {
    const errors = hint(searchgeom)

    if (errors.length > 0) {
      throw new Error(`Geometry not valid: ${errors[0].message}`)
    }
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
  const hasSearchGeom = 'searchgeom' in parsedParams

  if ((hasLat && !hasLon) || (hasLon && !hasLat)) {
    throw createError(400, 'Failed parsing query', {detail: ['lon/lat must be present together if defined']})
  }

  const parcelOnly = parsedParams.indexes.length === 1 && parsedParams.indexes[0] === 'parcel'

  if (operation === 'search' && !parcelOnly && !('q' in parsedParams)) {
    throw createError(400, 'Failed parsing query', {detail: ['q is a required param']})
  }

  if (operation === 'reverse' && parsedParams.indexes.includes('address') && 'searchgeom' in parsedParams && !['Polygon', 'Circle'].includes(parsedParams.searchgeom.type)) {
    throw createError(400, 'Failed parsing query', {detail: [`Geometry type '${parsedParams.searchgeom.type}' not allowed for address index`]})
  }

  if (operation === 'reverse' && (!hasLon && !hasSearchGeom)) {
    throw createError(400, 'Failed parsing query', {detail: ['At least lon/lat or searchgeom must be defined']})
  }

  return parsedParams
}
