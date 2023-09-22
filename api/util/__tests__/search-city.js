import test from 'ava'
import {searchCity, normalizeString} from '../search-city.js'

test('searchCity', t => {
  t.deepEqual(searchCity('t'), [])
  t.deepEqual(searchCity('y'), [{code: '80829', nom: 'Y', score: 1}])

  const metz = searchCity('metz')
  t.is(metz.length, 8)
  t.is(metz[0].code, '57463')

  const stEtienne = searchCity('st etienne')
  t.is(stEtienne.length, 65)
  t.is(stEtienne[0].code, '42218')

  const nantes = searchCity('nantes')
  t.is(nantes.length, 2)
  t.is(nantes[0].code, '44109')

  const paris7 = searchCity('paris 7e')
  t.is(paris7.length, 1)
  t.is(paris7[0].code, '75107')

  t.is(searchCity('saint sauveur').length, 35)
})

test('normalizeString', t => {
  t.is(normalizeString('Metz'), 'metz')
  t.is(normalizeString('Saint-Étienne'), 'st etienne')
  t.is(normalizeString('Lorry-lès-Metz'), 'lorry les metz')
  t.is(normalizeString('Y'), 'y')
})
