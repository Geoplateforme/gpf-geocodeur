import test from 'ava'
import {searchCity, normalizeString} from '../search-city.js'

test('searchCity', t => {
  t.is(searchCity('t'), undefined)
  t.is(searchCity('y'), '80829')
  t.is(searchCity('metz'), '57463')
  t.is(searchCity('st etienne'), '42218')
  t.is(searchCity('nantes'), '44109')
  t.is(searchCity('paris 7e'), '75107')
})

test('normalizeString', t => {
  t.is(normalizeString('Metz'), 'metz')
  t.is(normalizeString('Saint-Étienne'), 'st etienne')
  t.is(normalizeString('Lorry-lès-Metz'), 'lorry les metz')
  t.is(normalizeString('Y'), 'y')
})
