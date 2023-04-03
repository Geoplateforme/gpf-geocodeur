import createError from 'http-errors'
import {normalizeQuery} from './util/querystring.js'

const qMaxLength = 200

export function isFirstCharValid(string) {
  return (string.slice(0, 1).toLowerCase() !== string.slice(0, 1).toUpperCase())
    || (string.codePointAt(0) >= 48 && string.codePointAt(0) <= 57)
}

export function validateQ(q, required = true) {
  if (!q && required) {
    throw createError(400, 'Parse query failed', {detail: [
      'Error: Missing [q] parameter'
    ]})
  }

  if (required) {
    if (typeof q !== 'string') {
      throw createError(400, 'Parse query failed', {detail: [
        'Error: Parameter [q] must be a string'
      ]})
    }

    const trimmedQ = q.trim()

    if (trimmedQ.length < 3 || trimmedQ.length > qMaxLength || !isFirstCharValid(trimmedQ)) {
      throw createError(400, 'Parse query failed', {detail: [
        `Error: Parameter [q] must contain between 3 and ${qMaxLength} chars and start with a number or a letter`
      ]})
    }

    return trimmedQ
  }
}

export function validateLonLat(lon, lat) {
  if ((lon && lat === undefined) || (lat && lon === undefined)) {
    throw createError(400, 'Parse query failed', {detail: [
      'Error: lon/lat must be present together if defined'
    ]})
  }

  const parsedLon = Number.parseFloat(lon)
  const parsedLat = Number.parseFloat(lat)

  if (Number.isNaN(parsedLon) || lon <= -180 || lon >= 180 || Number.isNaN(parsedLat) || lat <= -90 || lat >= 90) {
    throw createError(400, 'Parse query failed', {detail: [
      'Error: lon/lat must be valid WGS-84 coordinates'
    ]})
  }

  return [parsedLon, parsedLat]
}

// TODO: Should inherit from config
const availableIndexes = new Set(['address', 'poi', 'parcel'])
const defaultIndex = ['address']

export function validateIndexes(index) {
  if (index === undefined) {
    return defaultIndex
  }

  if (typeof index !== 'string') {
    throw createError(400, 'Parse query failed', {detail: [
      'Error: index must be a string'
    ]})
  }

  const indexes = index.split(',')

  if (indexes.some(i => !availableIndexes.has(i))) {
    throw createError(400, 'Parse query failed', {detail: [
      'Error: index must contain valid index names'
    ]})
  }

  // Take care of duplicates
  return [...new Set(indexes)]
}

export const PARAMS = {
  indexes: {
    nameInQuery: 'index',
    type: 'string',
    array: true,
    required: false,
    allowedValues: ['address', 'poi', 'address'],
    defaultValue: ['address']
  },

  limit: {
    type: 'integer',
    defaultValue: 5,
    validate(v) {
      if (v < 1 || v > 20) {
        throw new Error('Param limit must be an integer between 1 and 20')
      }
    }
  }
}

export function parseValue(value, type) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return undefined
  }

  if (type === 'string') {
    return trimmedValue.length > 0 ? trimmedValue : undefined
  }

  if (type === 'integer') {
    if (!/^([+-]?[1-9]\d*|0)$/.test(trimmedValue)) {
      throw new TypeError('Unable to parse as integer')
    }

    const num = Number.parseInt(trimmedValue, 10)

    if (Number.isNaN(num)) {
      throw new TypeError('Unable to parse as integer')
    }

    return num
  }

  throw new TypeError('Unsupported value type: ' + type)
}

export function parseArrayValues(values, type) {
  const arrayValues = values.split(',')
    .map(v => parseValue(v, type))
    .filter(Boolean)

  return arrayValues.length > 0 ? arrayValues : undefined
}

export function extractParam(query, paramName, definition) {
  const {type, array, allowedValues, required, defaultValue, nameInQuery, validate} = definition

  const rawValue = query[nameInQuery || paramName]
  let parsedValue

  // Parsing
  if (rawValue) {
    parsedValue = array
      ? parseArrayValues(rawValue, type)
      : parseValue(rawValue, type)
  }

  // Enum
  if (parsedValue && allowedValues) {
    if (array) {
      const unexpectedValue = parsedValue.find(v => !allowedValues.includes(v))
      if (unexpectedValue) {
        throw new Error(`Unexpected value '${unexpectedValue}' for param ${paramName}`)
      }
    } else if (!allowedValues.includes(parsedValue)) {
      throw new Error(`Unexpected value '${parsedValue}' for param ${paramName}`)
    }
  }

  // Validation
  if (parsedValue !== undefined && validate) {
    validate(parsedValue)
  }

  // Required
  if (parsedValue === undefined && required) {
    throw new Error(`${paramName} is a required param`)
  }

  // Default value
  if (parsedValue === undefined && defaultValue) {
    parsedValue = defaultValue
  }

  return parsedValue
}

export function extractParams(query) {
  const params = {}
  const errors = []

  for (const [paramName, definition] of Object.entries(PARAMS)) {
    try {
      const parsedValue = extractParam(query, paramName, definition)
      if (parsedValue !== undefined) {
        params[paramName] = parsedValue
      }
    } catch (error) {
      errors.push(error.message)
    }
  }

  if (errors.length > 0) {
    throw createError(400, 'Failed parsing query', {detail: errors})
  }

  return params
}

export default function validateParams(query, {operation, parcelOnly}) {
  const {q, lon, lat} = normalizeQuery(query)
  const parsedParams = extractParams(normalizeQuery(query))

  if (operation === 'search') {
    parsedParams.q = validateQ(q, !parcelOnly)
  }

  if (lon || lat) {
    const lonLat = validateLonLat(lon, lat)
    parsedParams.lon = lonLat[0]
    parsedParams.lat = lonLat[1]
  }

  return parsedParams
}
