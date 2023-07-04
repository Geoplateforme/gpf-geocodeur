import test from 'ava'
import gdal from 'gdal-async'
import {getMeasure, featureToBbox} from '../communes.js'

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
