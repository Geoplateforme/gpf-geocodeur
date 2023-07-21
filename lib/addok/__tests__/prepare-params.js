import test from 'ava'
import {prepareParams} from '../prepare-params.js'

test('prepareParams / w/ center', t => {
  t.deepEqual(prepareParams({
    q: 'foo'
  }), {
    q: 'foo'
  })
})

test('prepareParams / w/o center', t => {
  t.deepEqual(prepareParams({
    q: 'foo',
    center: [1, 2]
  }), {
    q: 'foo',
    lon: 1,
    lat: 2
  })
})
