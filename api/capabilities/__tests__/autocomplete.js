import test from 'ava'
import computeAutocompleteCapabilities from '../autocomplete.js'

test('computeAutocompleteCapabilities / Fields', async t => {
  const computedCapabilities = await computeAutocompleteCapabilities()
  const {operations} = computedCapabilities

  t.truthy(operations[0].parameters.find(k => k.name === 'bbox'))
  t.truthy(operations[0].parameters.find(k => k.name === 'poiType'))
  t.is(operations[0].id, 'completion')
})
