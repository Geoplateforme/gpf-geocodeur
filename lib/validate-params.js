import createError from 'http-errors'

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

  if (limit > 20) {
    throw createError(400, 'Parse query failed', {detail: [
      'Error: Parameter [limit] must be lower or equal to 20'
    ]})
  }

  if (lon || lat) {
    validateLonLat(lon, lat)
  }
}
