import test from 'ava'
import request from 'supertest'
import express from 'express'

import createRouter from '../router.js'

test('search / address index', async t => {
  const app = express()

  const customIndexes = {
    dispatchRequest() {
      return {
        foo: [
          {bar: 'foobar'}
        ]
      }
    }
  }

  const router = createRouter({customIndexes})
  app.use('/', router)

  const response = await request(app)
    .get('/search')
    .query({q: 'test', limit: 10})

  t.is(response.status, 200)
  t.is(response.body.type, 'FeatureCollection')
  t.deepEqual(response.body.features, [{bar: 'foobar'}])
})

test('reverse / address index', async t => {
  const app = express()

  const customIndexes = {
    dispatchRequest() {
      return {
        foo: [
          {bar: 'reverse'}
        ]
      }
    }
  }

  const router = createRouter({customIndexes})
  app.use('/', router)

  const response = await request(app)
    .get('/reverse')
    .query({lat: 48.8566, lon: 2.3522})

  t.is(response.status, 200)
  t.is(response.body.type, 'FeatureCollection')
  t.deepEqual(response.body.features, [{bar: 'reverse'}])
})

test('search / empty response', async t => {
  const app = express()

  const customIndexes = {
    dispatchRequest() {
      return {
        foo: []
      }
    }
  }

  const router = createRouter({customIndexes})
  app.use('/', router)

  const response = await request(app)
    .get('/search')
    .query({q: 'empty', limit: 10})

  t.is(response.status, 200)
  t.is(response.body.type, 'FeatureCollection')
  t.deepEqual(response.body.features, [])
})

test('search / invalid query parameters', async t => {
  const app = express()

  const customIndexes = {
    dispatchRequest() {
      return {
        foo: [
          {bar: 'invalid'}
        ]
      }
    }
  }

  const router = createRouter({customIndexes})
  app.use('/', router)

  const response = await request(app)
    .get('/search')
    .query({q: 'test', limit: -1})

  t.is(response.status, 400)
  t.is(response.body.message, 'Failed parsing query')
  t.deepEqual(response.body.detail, ['Param limit must be an integer between 1 and 20'])
})

test('search / server error', async t => {
  const app = express()

  const customIndexes = {
    dispatchRequest() {
      throw new Error('Error')
    }
  }

  const router = createRouter({customIndexes})
  app.use('/', router)

  const response = await request(app)
    .get('/search')
    .query({q: 'test', limit: 10})

  t.is(response.status, 500)
  t.is(response.body.message, 'An unexpected error has occurred')
})
