import test from 'ava'
import mockFs from 'mock-fs'
import {editConfig} from '../edit-config.js'

test.before(() => {
  mockFs({
    'foo.yaml': 'Initial content foo $API_URL',
    'bar.yaml': 'Initial content bar $API_URL/bar'
  })
})

test.after(() => {
  mockFs.restore()
})

test('editConfig', async t => {
  const yamlPathA = 'foo.yaml'
  const yamlPathB = 'bar.yaml'
  const apiUrl = 'https://api.example.com'

  const editedContentA = await editConfig(yamlPathA, apiUrl, 'foo')
  const editedContentB = await editConfig(yamlPathB, apiUrl, 'bar')

  t.is(editedContentA, 'Initial content foo https://api.example.com')
  t.is(editedContentB, 'Initial content bar https://api.example.com/bar')
})
