import createError from 'http-errors'

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

  if (!q && !parcel) {
    throw createError(400, 'Parse query failed', {detail: [
      'Error: Missing [q] parameter'
    ]})
  }

  if (limit) {
    validateLimit(limit)
  }

  if (lon || lat) {
    validateLonLat(lon, lat)
  }
}
