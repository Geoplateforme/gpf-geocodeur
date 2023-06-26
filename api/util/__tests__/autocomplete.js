import test from 'ava'
import {getCenterFromCoordinates} from '../autocomplete.js'

test('getCenterFromCoordinates', t => {
  t.is(getCenterFromCoordinates({}), undefined)
  t.deepEqual(getCenterFromCoordinates({lonlat: [2, 45]}), {lon: 2, lat: 45})
  t.deepEqual(getCenterFromCoordinates({bbox: [1, -66, 2, -66], lonlat: [2, 45]}), {lon: 2, lat: 45})
  t.deepEqual(getCenterFromCoordinates({bbox: [1, -66, 2, -66]}), {lon: 1.5, lat: -66})
})
