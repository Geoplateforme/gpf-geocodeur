import test from 'ava'
import {prepareRequest} from '../address.js'

const params = {
  indexes: ['address'],
  q: 'metz',
  limit: 5,
  autocomplete: true
}

test('prepareRequest', t => {
  const preparedRequest = prepareRequest(params)

  t.is(preparedRequest.q, 'metz')
  t.is(preparedRequest.center, undefined)
  t.is(preparedRequest.limit, 5)
  t.true(preparedRequest.autocomplete)
})
