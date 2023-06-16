import test from 'ava'
import {getNomCommune} from '../cog.js'

test('getNomCommune', t => {
  t.is(getNomCommune('57463'), 'Metz')
  t.is(getNomCommune('97424'), 'Cilaos')
})

test('getNomCommune / not found', t => {
  t.is(getNomCommune('57'), undefined)
  t.is(getNomCommune('88888'), undefined)
  t.is(getNomCommune('abcde'), undefined)
})
