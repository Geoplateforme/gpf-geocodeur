import test from 'ava'
import {validateCoordinateValues} from '../coordinates.js'

test('validateCoordinateValues', t => {
  t.is(validateCoordinateValues([2.1, 48.5, 2, 0, -2.5, +2.5]), undefined)
  t.is(validateCoordinateValues(['2.1', '48.5', '2', '0', '-2.5', '+2.5']), undefined)

  t.throws(() => validateCoordinateValues(['abc', 2]), {message: 'Unable to parse value as float'})
  t.throws(() => validateCoordinateValues([2, '1.0abc']), {message: 'Unable to parse value as float'})
})
