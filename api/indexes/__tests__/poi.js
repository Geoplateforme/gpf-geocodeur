import test from 'ava'
import {prepareRequest} from '../poi.js'

test('prepareRequest / limit < 10', t => {
  const preparedRequest = prepareRequest({
    q: 'metz',
    limit: 5,
    autocomplete: true,
    geometry: {
      type: 'Point',
      coordinates: [0, 0]
    }
  })

  t.is(preparedRequest.q, 'metz')
  t.is(preparedRequest.center, undefined)
  t.is(preparedRequest.limit, 10)
  t.true(preparedRequest.autocomplete)
})

test('prepareRequest / limit >= 10', t => {
  const preparedRequest = prepareRequest({
    q: 'metz',
    limit: 11,
    autocomplete: true,
    geometry: {
      type: 'Point',
      coordinates: [0, 0]
    }
  })

  t.is(preparedRequest.q, 'metz')
  t.is(preparedRequest.center, undefined)
  t.is(preparedRequest.limit, 11)
  t.true(preparedRequest.autocomplete)
})
