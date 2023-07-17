/* eslint-disable unicorn/numeric-separators-style */
import test from 'ava'
import {transformParcel} from '../transform.js'

test('transformParcel', t => {
  const originalFeature = {
    properties: {
      IDU: 'featureId',
      CODE_DEP: '55',
      CODE_COM: '501',
      COM_ABS: '511',
      CODE_ARR: '101',
      SECTION: '0A',
      FEUILLE: 4,
      NUMERO: '0001'
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

  t.deepEqual(transformParcel(originalFeature), {
    type: 'Feature',
    properties: {
      id: 'featureId',
      departmentcode: '55',
      municipalitycode: '501',
      oldmunicipalitycode: '511',
      districtcode: '101',
      section: '0A',
      sheet: '04',
      number: '0001',
      lon: -73.98765,
      lat: 40.766149999999996
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
  })
})
