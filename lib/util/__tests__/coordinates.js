import test from 'ava'
import {validateCoordinateValues} from '../coordinates.js'

test('validateCoordinateValues', t => {
  t.is(validateCoordinateValues([2.1, 48.5, 2, 0, -2.5, +2.5]), undefined)

  t.throws(() => validateCoordinateValues(['2.1', '48.5', '2', '0', '-2.5', '+2.5']), {message: 'One or more coordinate values are not numbers'})
  t.throws(() => validateCoordinateValues(['abc', 2]), {message: 'One or more coordinate values are not numbers'})
  t.throws(() => validateCoordinateValues([2, '1.0abc']), {message: 'One or more coordinate values are not numbers'})
})
