import test from 'ava'
import {featureMatches, bboxMaxLength, sortAndPickResults, computeScore, extractIntersectingTiles, valueMatches} from '../util.js'

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

test('featureMatches / filter simple value', t => {
  t.true(featureMatches(
    {type: 'Feature', geometry: null, properties: {simple: 'one'}},
    null,
    {simple: 'one'}
  ))
})

test('featureMatches / filter array value', t => {
  t.true(featureMatches(
    {type: 'Feature', geometry: null, properties: {multiple: ['one', 'two']}},
    null,
    {multiple: 'one'}
  ))
})

test('bboxMaxLength', t => {
  const bbox = [0, 0, 1, 1]
  const maxLength = bboxMaxLength(bbox)
  const roundMaxLength = Math.round(maxLength * 10) / 10

  t.is(roundMaxLength, 111.2)
})

test('sortAndPickResults', t => {
  const results = [
    {
      name: 'foo',
      properties: {distance: 10},
      geometry: {
        type: 'Point',
        coordinates: [-91.3403, 0.1164]
      }
    },
    {
      name: 'bar',
      properties: {distance: 5},
      geometry: {
        type: 'Point',
        coordinates: [-91.3403, 0.5164]
      }
    },
    {
      name: 'foobar',
      properties: {distance: 15},
      geometry: {
        type: 'Point',
        coordinates: [-92.3403, 0.2164]
      }
    }
  ]

  const pickedResultOne = sortAndPickResults(results, {
    limit: 2,
    center: {type: 'Point'}
  })

  const pickedResultTwo = sortAndPickResults(results, {limit: 5})

  t.is(pickedResultOne.length, 2)
  t.is(pickedResultOne[0].name, 'bar')
  t.is(pickedResultOne[1].name, 'foo')

  t.is(pickedResultTwo.length, 3)
  t.is(pickedResultTwo[0].name, 'foo')
  t.is(pickedResultTwo[2].name, 'foobar')
})

test('computeScore', t => {
  const far = computeScore(5)
  const near = computeScore(1)

  t.is(far, 0.9995)
  t.is(near, 0.9999)
})

test('extractIntersectingTiles', t => {
  t.deepEqual(extractIntersectingTiles({
    coordinates: [
      [
        [
          6.146_559_068_778_885,
          49.155_098_557_172_95
        ],
        [
          6.128_952_349_766_308,
          49.108_796_765_464_69
        ],
        [
          6.190_071_215_126_494,
          49.114_375_817_094_98
        ],
        [
          6.183_118_243_287_453,
          49.146_663_259_683_21
        ],
        [
          6.146_559_068_778_885,
          49.155_098_557_172_95
        ]
      ]
    ],
    type: 'Polygon'
  }).sort(), [
    '13/4235/2807',
    '13/4235/2808',
    '13/4235/2809',
    '13/4236/2807',
    '13/4236/2808',
    '13/4236/2809'
  ])
})

test('valueMatches', t => {
  t.true(valueMatches('foo', 'foo'))
  t.false(valueMatches('foo', 'bar'))

  t.true(valueMatches('foo', ['foo']))
  t.false(valueMatches('foo', ['bar']))
  t.true(valueMatches('foo', ['foo', 'bar']))

  t.true(valueMatches(['foo'], 'foo'))
  t.true(valueMatches(['foo', 'bar'], 'foo'))
  t.false(valueMatches(['bar'], 'foo'))

  t.true(valueMatches(['foo'], ['foo', 'bar']))
  t.true(valueMatches(['foo', 'bar'], ['foo', 'bar']))
  t.true(valueMatches(['foo', 'bar'], ['foo', 'foo']))
  t.false(valueMatches(['foo', 'bar'], ['a', 'b']))
})
