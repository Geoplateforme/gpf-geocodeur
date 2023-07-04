import test from 'ava'
import {getCommune, getDepartements} from '../cog.js'

test('getCommune - 57222', t => {
  const commune = getCommune('57222')
  t.is(commune.code, '57222')
})

test('getCommune - 97121', t => {
  const commune = getCommune('97121')
  t.is(commune.code, '97121')
})

test('getCommune - no result', t => {
  const commune = getCommune('12345')
  t.is(commune, undefined)
})

test('getDepartements', t => {
  const departements = getDepartements()
  t.is(departements.length, 109)
})
