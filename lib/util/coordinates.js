export function validateCoordinateValues(coordinates) {
  for (const coordinate of coordinates) {
    if (!/^[+-]?(\d+(\.\d*)?)$/.test(coordinate)) {
      throw new TypeError('Unable to parse value as float')
    }

    const num = Number.parseFloat(coordinate)

    if (Number.isNaN(num)) {
      throw new TypeError('Unable to parse value as float')
    }
  }
}
