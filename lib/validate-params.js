import createError from 'http-errors'

const qMaxLength = 200

function isFirstCharValid(string) {
  return (string.slice(0, 1).toLowerCase() !== string.slice(0, 1).toUpperCase())
    || (string.codePointAt(0) >= 48 && string.codePointAt(0) <= 57)
}

function validateQ(q, parcel) {
  if (!q && !parcel) {
    throw createError(400, 'Parse query failed', {detail: [
      'Error: Missing [q] parameter'
    ]})
  }

  if (!parcel) {
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
  }
}

function validateLimit(limit) {
  const parsedLimit = Number.parseInt(limit, 10)

  if (!Number.isInteger(parsedLimit) || limit < 1 || limit > 20) {
    throw createError(400, 'Parse query failed', {detail: [
      'Error: Parameter [limit] must be an integer between 1 and 20'
    ]})
  }
}

function validateLonLat(lon, lat) {
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
}

export default function validateParams({params, parcel}) {
  const {q, limit, lon, lat} = params

  validateQ(q, parcel)

  if (limit) {
    validateLimit(limit)
  }

  if (lon || lat) {
    validateLonLat(lon, lat)
  }
}
