import createError from 'http-errors'

export function validateCoordinatesValue(coordinates) {
  if (!coordinates || coordinates.length !== 2) {
    throw new Error('Coordinates must be an array of two entries')
  }

  if (coordinates.some(c => typeof c !== 'number' || Number.isNaN(c))) {
    throw new Error('Coordinates must be an array of float numbers')
  }

  const [lon, lat] = coordinates

  if (lon < -180 || lon > 180) {
    throw new Error('Longitude must be a float between -180 and 180')
  }

  if (lat < -85 || lat > 85) {
    throw new Error('Latitude must be a float between -85 and 85')
  }
}

export function validateCircle(geometry, maxRadius) {
  if (!('radius' in geometry)) {
    throw createError(400, 'Geometry not valid: radius property is missing')
  }

  const {radius} = geometry

  if (typeof radius !== 'number' || Number.isNaN(radius) || radius <= 0) {
    throw createError(400, 'Geometry not valid: radius must be a positive float')
  }

  if (maxRadius && radius > maxRadius) {
    throw createError(400, 'Geometry not valid: radius must be a float between 0 and ' + maxRadius)
  }

  try {
    validateCoordinatesValue(geometry.coordinates)
  } catch (error) {
    throw createError(400, `Geometry not valid: ${error.message}`)
  }
}
