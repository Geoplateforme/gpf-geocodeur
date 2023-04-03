import test from 'ava'
import {normalizeQuery, ensureSingleValue} from '../lib/util/querystring.js'

test('ensureSingleValue', t => {
  t.is(ensureSingleValue(['foo', 'bar', 'baz']), 'baz')
  t.is(ensureSingleValue(['foo']), 'foo')
  t.is(ensureSingleValue('bar'), 'bar')
})

test('normalizeQuery', t => {
  t.deepEqual(normalizeQuery({
    FOO: ['a', 'b', 'c'],
    Bar: '1',
    ' plop ': ['X', 'Y']
  }), {
    foo: 'c',
    bar: '1',
    plop: 'Y'
  })
})
