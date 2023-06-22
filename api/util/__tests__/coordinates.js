import test from 'ava'
import {validateCoordinatesValue, getCoordinates} from '../coordinates.js'

test('validateCoordinatesValue', t => {
  t.is(validateCoordinatesValue([2.1, 48.5]), undefined)

  t.throws(
    () => validateCoordinatesValue([2.1, 48.5, 77]),
    {message: 'Coordinates must be an array of two entries'}
  )

  t.throws(
    () => validateCoordinatesValue(['2.1', '48.5']),
    {message: 'Coordinates must be an array of float numbers'}
  )

  t.throws(
    () => validateCoordinatesValue([240, 48.5]),
    {message: 'Longitude must be a float between -180 and 180'}
  )

  t.throws(
    () => validateCoordinatesValue([120, 98.5]),
    {message: 'Latitude must be a float between -85 and 85'}
  )
})

test('getCoordinates', t => {
  t.is(getCoordinates({}), undefined)
  t.deepEqual(getCoordinates({lonlat: [2, 45]}), {lon: 2, lat: 45})
  t.deepEqual(getCoordinates({bbox: [1, -66, 2, -66], lonlat: [2, 45]}), {lon: 2, lat: 45})
  t.deepEqual(getCoordinates({bbox: [1, -66, 2, -66]}), {lon: 1.5, lat: -66})
})
