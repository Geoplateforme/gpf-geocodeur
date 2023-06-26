import test from 'ava'
import {getCoordinates} from '../autocomplete.js'

test('getCoordinates', t => {
  t.is(getCoordinates({}), undefined)
  t.deepEqual(getCoordinates({lonlat: [2, 45]}), {lon: 2, lat: 45})
  t.deepEqual(getCoordinates({bbox: [1, -66, 2, -66], lonlat: [2, 45]}), {lon: 2, lat: 45})
  t.deepEqual(getCoordinates({bbox: [1, -66, 2, -66]}), {lon: 1.5, lat: -66})
})
