/* eslint-disable unicorn/numeric-separators-style */
import test from 'ava'
import {transformParcel} from '../transform.js'

const aFeature = {
  properties: {
    IDU: 'featureId',
    CODE_DEP: 55,
    CODE_COM: 55200,
    COM_ABS: 55500,
    CODE_ARR: 55120,
    SECTION: 123,
    FEUILLE: 4,
    NUMERO: 1
  },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-73.9876, 40.7661],
        [-73.9877, 40.7661],
        [-73.9877, 40.7662],
        [-73.9876, 40.7662],
        [-73.9876, 40.7661]
      ]
    ]
  }
}

test('transformParcel', t => {
  const transformedFeature = transformParcel(aFeature)

  t.deepEqual(transformedFeature, {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-73.9876, 40.7661],
          [-73.9877, 40.7661],
          [-73.9877, 40.7662],
          [-73.9876, 40.7662],
          [-73.9876, 40.7661]
        ]
      ]
    },
    properties: {
      id: 'featureId',
      departmentcode: 55,
      municipalitycode: 55200,
      oldMunicipalitycode: 55500,
      districtcode: 55120,
      section: 123,
      sheet: '04',
      number: 1,
      lon: -73.98765,
      lat: 40.766149999999996
    }
  })
})
