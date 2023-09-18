import test from 'ava'
import {getCommune, getDepartements, isPLM, getCodesCommunesMembresEpci} from '../cog.js'

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

test('isPLM', t => {
  t.true(isPLM({code: '75056'}))
  t.true(isPLM({code: '13055'}))
  t.true(isPLM({code: '69123'}))
  t.false(isPLM({code: '54084'}))
})

test('getCodesCommunesMembresEpci / Metz Métropole', t => {
  const mm = getCodesCommunesMembresEpci('200039865')
  t.is(mm.length, 46)
  t.true(mm.includes('57463'))
})
