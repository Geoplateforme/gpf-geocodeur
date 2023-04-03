import createError from 'http-errors'
import {normalizeQuery} from './lib/querystring.js'

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

export function validateLimit(limit) {
  const parsedLimit = Number.parseInt(limit, 10)

  if (!Number.isInteger(parsedLimit) || limit < 1 || limit > 20) {
    throw createError(400, 'Parse query failed', {detail: [
      'Error: Parameter [limit] must be an integer between 1 and 20'
    ]})
  }

  return parsedLimit
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

export default function validateParams(query, {operation, parcelOnly}) {
  const {q, limit, lon, lat, index} = normalizeQuery(query)
  const parsedParams = {}

  parsedParams.indexes = validateIndexes(index)

  if (operation === 'search') {
    parsedParams.q = validateQ(q, !parcelOnly)
  }

  if (limit) {
    parsedParams.limit = validateLimit(limit)
  }

  if (lon || lat) {
    const lonLat = validateLonLat(lon, lat)
    parsedParams.lon = lonLat[0]
    parsedParams.lat = lonLat[1]
  }

  return parsedParams
}
