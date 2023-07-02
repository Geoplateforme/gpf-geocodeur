import test from 'ava'
import {featureMatches, bboxMaxLength} from '../util.js'

test('featureMatches', t => {
  const feature = {
    type: 'Feature',
    properties: {
      foo: 'bar',
      bar: 'foo'
    },
    geometry: {
      type: 'Point',
      coordinates: [0, 0]
    }
  }

  t.true(featureMatches(feature, null, {}))
  t.true(featureMatches(feature, null, {foo: 'bar', bar: 'foo'}))
  t.false(featureMatches(feature, null, {foo: 'foo'}))
  t.false(featureMatches(feature, {type: 'Polygon', coordinates: [[[2, 2], [2, 3], [3, 3], [3, 2], [2, 2]]]}, {}))
})

test('bboxMaxLength', t => {
  const bbox = [0, 0, 1, 1]
  const maxLength = bboxMaxLength(bbox)
  const roundMaxLength = Math.round(maxLength * 10) / 10

  t.is(roundMaxLength, 111.2)
})
