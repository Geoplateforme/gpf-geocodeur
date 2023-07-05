/* eslint import/first: off */
import process from 'node:process'
import test from 'ava'
import nock from 'nock'

process.env.POI_INDEX_URL = 'http://poi-index'

import computeAutocompleteCapabilities from '../autocomplete.js'

test('computeAutocompleteCapabilities / Fields', async t => {
  nock(process.env.POI_INDEX_URL)
    .get('/categories')
    .reply(200, {
      cimetiere: [],
      construction: ['pont', 'croix']
    })

  const computedCapabilities = await computeAutocompleteCapabilities()
  const {operations, indexes} = computedCapabilities

  t.truthy(operations[0].parameters.find(k => k.name === 'bbox'))

  const poiIndex = indexes.find(i => i.id === 'PositionOfInterest')
  t.truthy(poiIndex)

  const poiType = poiIndex.fields.find(f => f.name === 'poiType')
  t.truthy(poiType)

  t.deepEqual(poiType.values, {
    cimetiere: [],
    construction: ['pont', 'croix']
  })

  t.is(operations[0].id, 'completion')
})
