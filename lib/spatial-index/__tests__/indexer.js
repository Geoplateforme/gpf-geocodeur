import path from 'node:path'
import {mkdtemp, rm, access} from 'node:fs/promises'
import test from 'ava'
import {getId, createIndexer} from '../indexer.js'

test('getId', t => {
  t.is(getId({id: 'foo'}, {}), 'foo')
  t.is(getId({id: 'one', otherId: 'bar'}, {idKey: 'otherId'}), 'bar')
  t.is(getId({id: 'one', otherId: 'bar'}, {idFn: obj => obj.otherId}), 'bar')
})

test('createIndexer', async t => {
  const tmpDir = await mkdtemp('indexer-test-')
  t.teardown(() => rm(tmpDir, {recursive: true}))

  const basePath = path.join(tmpDir, 'test')

  const features = [
    {type: 'Feature', geometry: {type: 'Point', coordinates: [1, 1]}, properties: {id: 'one'}},
    {type: 'Feature', geometry: {type: 'Point', coordinates: [2, 2]}, properties: {id: 'two'}}
  ]

  const indexer = await createIndexer(basePath, {geometryType: 'Point'})
  t.is(indexer.written, 0)
  t.is(indexer.writing, 0)

  await indexer.writeFeatures(features)
  t.is(indexer.written, 2)
  t.is(indexer.writing, 0)

  await t.throwsAsync(() => indexer.writeFeatures([
    {type: 'Feature', geometry: {type: 'Point', coordinates: [1, 1]}, properties: {malformedIdKey: 'one'}}
  ]), {message: 'Found feature without id'})

  await t.notThrowsAsync(() => access(basePath + '.mdb'))
  await t.notThrowsAsync(() => access(basePath + '.mdb-lock'))
  await t.notThrowsAsync(() => access(basePath + '-bboxes.tmp'))
  await t.throwsAsync(() => access(basePath + '.rtree'))

  await indexer.finish()
  t.is(indexer.written, 2)
  t.is(indexer.writing, 0)

  await t.notThrowsAsync(() => access(basePath + '.mdb'))
  await t.notThrowsAsync(() => access(basePath + '.mdb-lock'))
  await t.throwsAsync(() => access(basePath + '-bboxes.tmp'))
  await t.notThrowsAsync(() => access(basePath + '.rtree'))
})
