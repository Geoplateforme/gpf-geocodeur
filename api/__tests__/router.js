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

test('completion', async t => {
  const app = express()

  const customIndexes = {
    dispatchRequest() {
      return {}
    }
  }

  const router = createRouter({customIndexes})
  app.use('/', router)

  const response = await request(app)
    .get('/completion')
    .query({text: 'test'})

  t.is(response.status, 200)
  t.deepEqual(response.body, {
    status: 'OK',
    results: []
  })
})

test('completion / with error', async t => {
  const app = express()

  const customIndexes = {
    dispatchRequest() {
      throw new Error('Error in autocomplete')
    }
  }

  const router = createRouter({customIndexes})
  app.use('/', router)

  const response = await request(app)
    .get('/completion')
    .query({text: 'test'})

  t.is(response.status, 200)
  t.deepEqual(response.body, {
    status: 'Error',
    error: 'Error in autocomplete'
  })
})

test('getCapabilities / geocodage', async t => {
  const app = express()

  const customIndexes = {
    dispatchRequest() {
      return {}
    }
  }

  const router = createRouter({customIndexes})
  app.use('/', router)

  const response = await request(app)
    .get('/geocodage/getCapabilities')

  t.is(response.status, 200)
  t.truthy(response.body.api)
  t.truthy(response.body.indexes)
  t.truthy(response.body.info)
  t.truthy(response.body.operations)
})

test('getCapabilities / autocomplete', async t => {
  const app = express()

  const customIndexes = {
    dispatchRequest() {
      return {}
    }
  }

  const router = createRouter({customIndexes})
  app.use('/', router)

  const response = await request(app)
    .get('/autocomplete/getCapabilities')

  t.is(response.status, 200)
  t.truthy(response.body.api)
  t.truthy(response.body.indexes)
  t.truthy(response.body.info)
  t.truthy(response.body.operations)
})

test('openAPI / geocode.yaml', async t => {
  const app = express()

  const customIndexes = {
    dispatchRequest() {
      return {}
    }
  }

  const router = createRouter({customIndexes})
  app.use('/', router)

  const response = await request(app)
    .get('/geocodage/openAPI/geocode.yaml')

  t.is(response.status, 200)
  t.is(response.headers['content-type'], 'text/yaml; charset=UTF-8')
})

test('openAPI / completion.yaml', async t => {
  const app = express()

  const customIndexes = {
    dispatchRequest() {
      return {}
    }
  }

  const router = createRouter({customIndexes})
  app.use('/', router)

  const response = await request(app)
    .get('/autocomplete/openAPI/completion.yaml')

  t.is(response.status, 200)
  t.is(response.headers['content-type'], 'text/yaml; charset=UTF-8')
})
