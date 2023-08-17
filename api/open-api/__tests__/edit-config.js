import test from 'ava'
import mockFs from 'mock-fs'
import {editConfig} from '../edit-config.js'

test.before(() => {
  mockFs({
    'foo.yaml': 'Initial content $API_URL'
  })
})

test.after(() => {
  mockFs.restore()
})

test('editConfig', async t => {
  const yamlPath = 'foo.yaml'
  const apiUrl = 'https://api.example.com'

  const editedContent = await editConfig(yamlPath, apiUrl)

  t.is(editedContent, 'Initial content https://api.example.com')
})
