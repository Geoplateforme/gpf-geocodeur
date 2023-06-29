import test from 'ava'
import mock from 'mock-fs'
import readJson from '../read-json.js'

test.before(() => {
  mock({
    'fake.json': '{"foo": "bar"}'
  })
})

test.after(() => {
  mock.restore()
})

test('readJson', async t => {
  const result = await readJson('fake.json')

  t.deepEqual(result, {foo: 'bar'})
})
