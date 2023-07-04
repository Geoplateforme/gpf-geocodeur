import test from 'ava'
import mockFs from 'mock-fs'
import Flatbush from 'flatbush'
import {Buffer} from 'node:buffer'

import {createRtree} from '../rtree.js'

test.before(() => {
  const indexedData = [
    [10, 20, 30, 40],
    [50, 60, 70, 80]
  ]

  const flatbush = new Flatbush(2)
  for (const item of indexedData) {
    flatbush.add(item[0], item[1], item[2], item[3])
  }

  flatbush.finish()

  mockFs({
    'test/test.rtree': Buffer.from(flatbush.data)
  })
})

test.after(() => {
  mockFs.restore()
})

test('createRtree', async t => {
  const rtreePath = 'test/test.rtree'
  const rtreeIndex = await createRtree(rtreePath)

  t.true(rtreeIndex instanceof Flatbush)
  t.true(rtreeIndex.search instanceof Function)
  t.true(rtreeIndex.neighbors instanceof Function)

  const neighbors = rtreeIndex.neighbors(10, 20, 2)
  t.deepEqual(neighbors, [0, 1])

  const searchResults = rtreeIndex.search(30, 40, 5, 10)
  t.deepEqual(searchResults, [])
})
