import {createRequire} from 'node:module'
import test from 'ava'
import gdal from 'gdal-async'
import nock from 'nock'
import {getMeasure, featureToBbox, createCommunesIndex} from '../communes.js'

const require = createRequire(import.meta.url)

test('getMeasure / dim 1', t => {
  const geom = gdal.Geometry.fromGeoJson({type: 'Point', coordinates: [0, 0]})
  t.is(getMeasure(geom), 1)
})

test('getMeasure / dim 2', t => {
  const geom = gdal.Geometry.fromGeoJson({type: 'LineString', coordinates: [[0, 0], [0, 10]]})
  t.is(getMeasure(geom), 10)
})

test('getMeasure / dim 3', t => {
  const geom = gdal.Geometry.fromGeoJson({type: 'Polygon', coordinates: [[[0, 0], [0, 2], [2, 2], [2, 0], [0, 0]]]})
  t.is(getMeasure(geom), 4)
})

test('featureToBbox', t => {
  const geom = gdal.Geometry.fromGeoJson({type: 'Polygon', coordinates: [[[0, 0], [0, 2], [2, 2], [2, 0], [0, 0]]]})
  const defn = new gdal.FeatureDefn()
  const feature = new gdal.Feature(defn)
  feature.setGeometry(geom)

  t.deepEqual(featureToBbox(feature), [0, 0, 2, 2])
})

test('createCommuneIndex', async t => {
  nock('http://geoservices')
    .get('/adminexpress.7z')
    .replyWithFile(200, require.resolve('./__fixtures__/microadminexpress.7z'))

  const communesIndex = await createCommunesIndex('http://geoservices/adminexpress.7z')
  t.teardown(() => communesIndex.close())

  const polyLorry = gdal.Geometry.fromGeoJson({
    coordinates: [
      [
        [
          6.121,
          49.1512
        ],
        [
          6.121,
          49.1383
        ],
        [
          6.1494,
          49.1383
        ],
        [
          6.1494,
          49.1512
        ],
        [
          6.121,
          49.1512
        ]
      ]
    ],
    type: 'Polygon'
  })

  t.deepEqual(communesIndex.getIntersectingCommunes(polyLorry), ['57415'])

  const pointMetz = gdal.Geometry.fromGeoJson({
    coordinates: [
      6.1749,
      49.1192
    ],
    type: 'Point'
  })

  t.deepEqual(communesIndex.getIntersectingCommunes(pointMetz), ['57463'])

  const pointLubey = gdal.Geometry.fromGeoJson({
    coordinates: [
      5.8573,
      49.2441
    ],
    type: 'Point'
  })

  t.deepEqual(communesIndex.getIntersectingCommunes(pointLubey), [])
})
