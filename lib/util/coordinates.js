export function validateCoordinateValues(coordinates) {
  function isNotNumber(coordinate) {
    return typeof coordinate !== 'number'
  }

  if (coordinates.some(coordinate => isNotNumber(coordinate))) {
    throw new TypeError('One or more coordinate values are not numbers')
  }
}
