/* eslint import/first: off */
import process from 'node:process'
import test from 'ava'
import nock from 'nock'

process.env.POI_INDEX_URL = 'http://poi-index'

import computeGeocodeCapabilities from '../geocode.js'

test('computeGeocodageCapabilities / Fields', async t => {
  nock(process.env.POI_INDEX_URL)
    .get('/categories')
    .reply(200, {
      cimetiere: [],
      construction: ['pont', 'croix']
    })

  const computedCapabilities = await computeGeocodeCapabilities()
  const searchOperations = computedCapabilities.operations[0]
  const reverseOperations = computedCapabilities.operations[1]

  t.truthy(searchOperations.parameters.find(k => k.name === 'sheet'))
  t.truthy(reverseOperations.parameters.find(k => k.name === 'searchgeom'))
  t.truthy(reverseOperations.parameters.find(k => k.name === 'sheet'))
  t.is(searchOperations.parameters.find(k => k.name === 'searchgeom'), undefined)
  t.is(searchOperations.id, 'search')
  t.is(reverseOperations.id, 'reverse')

  const poiIndex = computedCapabilities.indexes.find(i => i.id === 'poi')
  t.truthy(poiIndex)

  const category = poiIndex.fields.find(f => f.name === 'category')
  t.truthy(category)

  t.deepEqual(category.values, {
    cimetiere: [],
    construction: ['pont', 'croix']
  })
})

