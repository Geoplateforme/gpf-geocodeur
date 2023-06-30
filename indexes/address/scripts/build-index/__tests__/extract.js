import test from 'ava'
import {asFeature} from '../extract.js'

const properties = {
  lon: 12.25,
  lat: 55.08,
  property: 'Bonjour !'
}

test('asFeature / ok', t => {
  const asFeaturesProperties = asFeature(properties)

  t.deepEqual(asFeaturesProperties, {
    type: 'Feature',
    geometry: {type: 'Point', coordinates: [12.25, 55.08]},
    properties: {property: 'Bonjour !'}
  })
})
