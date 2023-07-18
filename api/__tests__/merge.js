import test from 'ava'
import {mergeResults} from '../merge.js'

test('mergeResults / no result', t => {
  const result = mergeResults({}, {limit: 10})

  t.deepEqual(result, [])
})

test('mergeResults / one index', t => {
  const indexesResults = {
    foo: [
      {properties: {score: 0.9}, data: 'foo'}
    ]
  }
  const expectedResult = [
    {properties: {score: 0.9, _type: 'foo'}, data: 'foo'}
  ]

  const result = mergeResults(indexesResults, {limit: 10})

  t.deepEqual(result, expectedResult)
})

test('mergeResults / empty index', t => {
  const indexesResults = {
    foo: [
      {properties: {score: 1}, data: 'foo'}
    ],
    bar: []
  }

  const result = mergeResults(indexesResults, {limit: 2})

  t.deepEqual(result, [
    {properties: {score: 1, _type: 'foo'}, data: 'foo'}
  ])
})

test('mergeResults / two indexes', t => {
  const indexesResults = {
    foo: [
      {properties: {score: 0.8}, data: 'foo'}
    ],
    bar: [
      {properties: {score: 0.7}, data: 'bar'}
    ]
  }

  const result = mergeResults(indexesResults, {limit: 2})

  t.deepEqual(result, [
    {properties: {score: 0.8, _type: 'foo'}, data: 'foo'},
    {properties: {score: 0.7, _type: 'bar'}, data: 'bar'}
  ])
})

test('mergeResults / limit results', t => {
  const indexesResults = {
    foo: [
      {properties: {score: 1}, data: 'foo1'},
      {properties: {score: 0.8}, data: 'foo2'}
    ],
    bar: [
      {properties: {score: 0.9}, data: 'bar'}
    ]
  }

  const result = mergeResults(indexesResults, {limit: 2})

  t.deepEqual(result, [
    {properties: {score: 1, _type: 'foo'}, data: 'foo1'},
    {properties: {score: 0.9, _type: 'bar'}, data: 'bar'}
  ])
})

test('mergeResults / two indexes with equal scores', t => {
  const indexesResults = {
    foo: [
      {properties: {score: 0.8}, data: 'foo'}
    ],
    bar: [
      {properties: {score: 0.8}, data: 'bar'}
    ],
    foobar: [
      {properties: {score: 0.9}, data: 'foobar'}
    ]
  }

  const result = mergeResults(indexesResults, {limit: 2})

  t.deepEqual(result, [
    {properties: {score: 0.9, _type: 'foobar'}, data: 'foobar'},
    {properties: {score: 0.8, _type: 'foo'}, data: 'foo'}
  ])
})

test('mergeResults / limit greater than total results', t => {
  const indexesResults = {
    foo: [
      {properties: {score: 1}, data: 'foo1'},
      {properties: {score: 0.8}, data: 'foo2'}
    ],
    bar: [
      {properties: {score: 0.9}, data: 'bar'}
    ]
  }

  const result = mergeResults(indexesResults, {limit: 5})

  t.deepEqual(result, [
    {properties: {score: 1, _type: 'foo'}, data: 'foo1'},
    {properties: {score: 0.9, _type: 'bar'}, data: 'bar'},
    {properties: {score: 0.8, _type: 'foo'}, data: 'foo2'}
  ])
})

test('mergeResults / post filters', t => {
  const indexesResults = {
    foo: [
      {properties: {score: 1, firstKey: 1}, data: 'foo1'},
      {properties: {score: 0.8, firstKey: 1, otherKey: 2}, data: 'foo2'}
    ],
    bar: [
      {properties: {score: 0.9, firstKey: 3}, data: 'bar'}
    ]
  }

  const postFilters = [
    r => r.properties.firstKey === 1,
    r => r.properties.otherKey === 2
  ]

  const result = mergeResults(indexesResults, {limit: 5, postFilters})

  t.deepEqual(result, [
    {properties: {score: 0.8, _type: 'foo', firstKey: 1, otherKey: 2}, data: 'foo2'}
  ])
})
