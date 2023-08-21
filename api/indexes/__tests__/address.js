import test from 'ava'
import {prepareRequest} from '../address.js'

test('prepareRequest / limit < 10', t => {
  const preparedRequest = prepareRequest({
    indexes: ['address'],
    q: 'metz',
    limit: 5,
    autocomplete: true
  })

  t.is(preparedRequest.q, 'metz')
  t.is(preparedRequest.center, undefined)
  t.is(preparedRequest.limit, 10)
  t.true(preparedRequest.autocomplete)
})

test('prepareRequest / limit >= 11', t => {
  const preparedRequest = prepareRequest({
    indexes: ['address'],
    q: 'metz',
    limit: 11,
    autocomplete: true
  })

  t.is(preparedRequest.q, 'metz')
  t.is(preparedRequest.center, undefined)
  t.is(preparedRequest.limit, 11)
  t.true(preparedRequest.autocomplete)
})
