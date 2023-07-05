import 'dotenv/config.js'
import process from 'node:process'
import test from 'ava'
import nock from 'nock'
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
})

