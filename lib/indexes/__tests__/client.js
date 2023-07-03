import test from 'ava'
import nock from 'nock'

import {createClient} from '../client.js'

test('createClient', async t => {
  nock('http://fake-service.tld')
    .post('/path/to/srv/operation', {foo: 'bar'})
    .reply(200, {foo: 'baz'})

  const client = createClient({indexUrl: 'http://fake-service.tld/path/to/srv'})

  const result = await client.execRequest('operation', {foo: 'bar'})
  t.deepEqual(result, {foo: 'baz'})
})
