import test from 'ava'
import fs from 'node:fs'
import {ENCODERS, createInstance} from '../lmdb.js'

test.beforeEach(t => {
  const tempDir = fs.mkdtempSync('tmp-test')
  t.context.tempDir = tempDir
})

test.afterEach.always(t => {
  const {tempDir} = t.context
  fs.rmSync(tempDir, {recursive: true, force: true})
})

test('createInstance', t => {
  const mdbPath = t.context.tempDir
  const options = {readOnly: false, geometryType: 'Point', cache: true}

  const instance = createInstance(mdbPath, options)

  t.truthy(instance.db)
  t.truthy(instance.featuresDb)
  t.truthy(instance.idIdxDb)
  t.truthy(instance.getFeatureByIdx)
  t.truthy(instance.getFeatureById)
})

test('getFeatureByIdx', t => {
  const mdbPath = t.context.tempDir
  const options = {readOnly: false, cache: true}
  const instance = createInstance(mdbPath, options)

  const feature1 = {type: 'Feature', properties: {id: 1}, geometry: {type: 'Point', coordinates: [10, 20]}}
  const feature2 = {type: 'Feature', properties: {id: 2}, geometry: {type: 'Point', coordinates: [30, 40]}}
  const feature3 = {type: 'Feature', properties: {id: 3}, geometry: {type: 'Point', coordinates: [50, 60]}}

  instance.featuresDb.put(1, feature1)
  instance.featuresDb.put(2, feature2)
  instance.featuresDb.put(3, feature3)

  const result = instance.getFeatureByIdx(2)

  t.deepEqual(result, feature2)
})

test('getFeatureById', t => {
  const mdbPath = t.context.tempDir
  const options = {readOnly: false, cache: true}
  const instance = createInstance(mdbPath, options)

  const feature1 = {type: 'Feature', properties: {id: 'foo'}, geometry: {type: 'Point', coordinates: [10, 20]}}
  const feature2 = {type: 'Feature', properties: {id: 'bar'}, geometry: {type: 'Point', coordinates: [30, 40]}}
  const feature3 = {type: 'Feature', properties: {id: 'foo-bar'}, geometry: {type: 'Point', coordinates: [50, 60]}}

  instance.featuresDb.put(1, feature1)
  instance.featuresDb.put(2, feature2)
  instance.featuresDb.put(3, feature3)

  instance.idIdxDb.put('foo', 1)
  instance.idIdxDb.put('bar', 2)
  instance.idIdxDb.put('foo-bar', 3)

  const result = instance.getFeatureById('foo-bar')

  t.deepEqual(result, feature3)
})

test('getFeatureById / id not found', t => {
  const mdbPath = t.context.tempDir
  const options = {readOnly: false, cache: true}
  const instance = createInstance(mdbPath, options)

  const result = instance.getFeatureById(99)

  t.is(result, undefined)
})

test('getFeatureByIdx / no index', t => {
  const mdbPath = t.context.tempDir
  const options = {readOnly: false, cache: true}
  const instance = createInstance(mdbPath, options)

  const feature = {type: 'Feature', properties: {id: 1}, geometry: {type: 'Point', coordinates: [10, 20]}}

  instance.featuresDb.put(1, feature)

  const error = t.throws(() => {
    instance.getFeatureByIdx(2)
  })

  t.is(error.message, 'No matching feature for idx 2')
})

test('ENCODERS.geobuf', t => {
  const feature = {
    type: 'Feature',
    properties: {name: 'Test Feature'},
    geometry: {
      type: 'Point',
      coordinates: [10, 20]
    }
  }

  const encoded = ENCODERS.geobuf.encode(feature)
  const decoded = ENCODERS.geobuf.decode(encoded)

  t.deepEqual(decoded, feature)
})

test('ENCODERS.point', t => {
  const feature = {
    type: 'Feature',
    properties: {name: 'Test Feature'},
    geometry: {
      type: 'Point',
      coordinates: [10, 20]
    }
  }

  const encoded = ENCODERS.point.encode(feature)
  const decoded = ENCODERS.point.decode(encoded)

  t.deepEqual(decoded, feature)
})

test('ENCODERS.geobuf / feature.type is not "Feature"', t => {
  const feature = {
    type: 'Invalid',
    properties: {name: 'Test Feature'},
    geometry: {
      type: 'Point',
      coordinates: [10, 20]
    }
  }

  t.throws(() => {
    ENCODERS.geobuf.encode(feature)
  }, {message: 'Unexpected object: geobuf can only encode Feature'})
})

test('ENCODERS.point / feature.type is not "Feature"', t => {
  const feature = {
    type: 'Invalid',
    properties: {name: 'Test Feature'},
    geometry: {
      type: 'Point',
      coordinates: [10, 20]
    }
  }

  t.throws(() => {
    ENCODERS.point.encode(feature)
  }, {message: 'Unexpected object: point can only encode Feature'})
})

test('ENCODERS.point / geometry.type is not "Point"', t => {
  const feature = {
    type: 'Feature',
    properties: {name: 'Test Feature'},
    geometry: {
      type: 'Polygon',
      coordinates: [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]
    }
  }

  t.throws(() => {
    ENCODERS.point.encode(feature)
  }, {message: 'Unexpected object: point can only encode Point'})
})
