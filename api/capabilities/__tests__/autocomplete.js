import 'dotenv/config.js'
import process from 'node:process'
import test from 'ava'
import nock from 'nock'
import computeAutocompleteCapabilities from '../autocomplete.js'

test('computeAutocompleteCapabilities / Fields', async t => {
  nock(process.env.POI_INDEX_URL)
    .get('/categories')
    .reply(200, {
      cimetiere: [],
      construction: ['pont', 'croix']
    })

  const computedCapabilities = await computeAutocompleteCapabilities()
  const {operations} = computedCapabilities

  t.truthy(operations[0].parameters.find(k => k.name === 'bbox'))
  t.truthy(operations[0].parameters.find(k => k.name === 'poiType'))
  t.is(operations[0].id, 'completion')
})
