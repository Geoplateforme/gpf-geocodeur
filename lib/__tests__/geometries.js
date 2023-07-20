import test from 'ava'
import {validateCoordinatesValue, validateCircle} from '../geometries.js'

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

test('validateCircle', t => {
  t.is(validateCircle({type: 'Circle', coordinates: [0, 0], radius: 100}, 1000), undefined)

  t.throws(
    () => validateCircle({type: 'Circle', coordinates: [0, 0]}, 1000),
    {message: 'Geometry not valid: radius property is missing'}
  )

  t.throws(
    () => validateCircle({type: 'Circle', coordinates: [0, 0], radius: false}, 1000),
    {message: 'Geometry not valid: radius must be a positive float'}
  )

  t.throws(
    () => validateCircle({type: 'Circle', coordinates: [0, 0], radius: Number.NaN}, 1000),
    {message: 'Geometry not valid: radius must be a positive float'}
  )

  t.throws(
    () => validateCircle({type: 'Circle', coordinates: [0, 0], radius: 0}, 1000),
    {message: 'Geometry not valid: radius must be a positive float'}
  )

  t.throws(
    () => validateCircle({type: 'Circle', coordinates: [0, 0], radius: -1}, 1000),
    {message: 'Geometry not valid: radius must be a positive float'}
  )

  t.throws(
    () => validateCircle({type: 'Circle', coordinates: [0, 0], radius: 200}, 100),
    {message: 'Geometry not valid: radius must be a float between 0 and 100'}
  )

  t.throws(
    () => validateCircle({type: 'Circle', coordinates: [-1000, 0], radius: 50}, 100),
    {message: 'Geometry not valid: Longitude must be a float between -180 and 180'}
  )
})
