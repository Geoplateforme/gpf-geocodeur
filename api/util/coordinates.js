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
