import {Readable} from 'node:stream'
import {createGzip} from 'node:zlib'
import test from 'ava'
import nock from 'nock'
import ndjson from 'ndjson'
import {asFeature, extractFeatures} from '../extract.js'

test('asFeature / ok', t => {
  const asFeaturesProperties = asFeature({
    lon: 12.25,
    lat: 55.08,
    property: 'Bonjour !'
  })

  t.deepEqual(asFeaturesProperties, {
    type: 'Feature',
    geometry: {type: 'Point', coordinates: [12.25, 55.08]},
    properties: {property: 'Bonjour !'}
  })
})

function createInputStream(items) {
  return Readable.from(items).pipe(ndjson.stringify()).pipe(createGzip())
}

test('extractFeatures', async t => {
  nock('http://ban')
    .get('/adresses.ndjson.gz')
    .reply(200, createInputStream([
      {id: '1', type: 'locality', name: 'Le Moulin', lon: 1, lat: 2},
      {id: '2', type: 'street', name: 'Rue des Champs', lon: 3, lat: 4, housenumbers: {
        1: {id: '3', lon: 10, lat: 11},
        2: {id: '4', lon: 20, lat: 21}
      }}
    ]))

  const iterator = extractFeatures('http://ban/adresses.ndjson.gz')
  const features = []

  for await (const feature of iterator) {
    features.push(feature)
  }

  t.deepEqual(features, [
    {
      type: 'Feature',
      geometry: {type: 'Point', coordinates: [1, 2]},
      properties: {
        id: '1',
        name: 'Le Moulin',
        type: 'locality'
      }
    },
    {
      type: 'Feature',
      geometry: {type: 'Point', coordinates: [3, 4]},
      properties: {
        id: '2',
        name: 'Rue des Champs',
        type: 'street'
      }
    },
    {
      type: 'Feature',
      geometry: {type: 'Point', coordinates: [10, 11]},
      properties: {
        id: '3',
        housenumber: '1',
        street: '2',
        type: 'housenumber'
      }
    },
    {
      type: 'Feature',
      geometry: {type: 'Point', coordinates: [20, 21]},
      properties: {
        id: '4',
        housenumber: '2',
        street: '2',
        type: 'housenumber'
      }
    }
  ])
})
