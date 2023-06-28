import test from 'ava'
import computeGeocodageCapabilities from '../compute-geocodage-capabilities.js'

test('computeGeocodageCapabilities / Fields', async t => {
  const computedCapabilities = await computeGeocodageCapabilities()
  const searchOperations = computedCapabilities.operations[0]
  const reverseOperations = computedCapabilities.operations[1]

  t.truthy(searchOperations.parameters.find(k => k.name === 'sheet'))
  t.truthy(reverseOperations.parameters.find(k => k.name === 'searchgeom'))
  t.truthy(reverseOperations.parameters.find(k => k.name === 'sheet'))
  t.is(searchOperations.parameters.find(k => k.name === 'searchgeom'), undefined)
  t.is(searchOperations.id, 'search')
  t.is(reverseOperations.id, 'reverse')
})

