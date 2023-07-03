import test from 'ava'
import {prepareRequest} from '../poi.js'

const params = {
  q: 'metz',
  limit: 5,
  autocomplete: true,
  geometry: {
    type: 'Point',
    coordinates: [0, 0]
  }
}

test('prepareRequest', t => {
  const preparedRequest = prepareRequest(params)

  t.is(preparedRequest.q, 'metz')
  t.is(preparedRequest.center, undefined)
  t.is(preparedRequest.limit, 5)
  t.true(preparedRequest.autocomplete)
})
