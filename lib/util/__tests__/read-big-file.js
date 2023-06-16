import test from 'ava'
import mockFs from 'mock-fs'
import {Buffer} from 'node:buffer'
import {createHash} from 'node:crypto'
import readBigFile from '../read-big-file.js'

const largeContent = Buffer.alloc(100 * 1024 * 1024) // 100 MB
const smallContent = Buffer.alloc(10 * 1024 * 1024) // 10 MB

function getBufferHash(buffer) {
  const hash = createHash('sha256')
  hash.update(buffer)
  return hash.digest('hex')
}

test.before(() => {
  mockFs({
    'large-file': largeContent,
    'small-file': smallContent
  })
})

test.after(() => {
  mockFs.restore()
})

test('readBigFile / large file', async t => {
  const arrayBuffer = await readBigFile('large-file')
  const fileSize = 100 * 1024 * 1024

  t.is(arrayBuffer.byteLength, fileSize)

  const originalHash = getBufferHash(Buffer.from(arrayBuffer))
  const expectedHash = getBufferHash(Buffer.from(largeContent))

  t.is(originalHash, expectedHash)
})

test('readBigFile / small file', async t => {
  const arrayBuffer = await readBigFile('small-file')
  const fileSize = 10 * 1024 * 1024

  t.is(arrayBuffer.byteLength, fileSize)

  const originalHash = getBufferHash(Buffer.from(arrayBuffer))
  const expectedHash = getBufferHash(Buffer.from(smallContent))

  t.is(originalHash, expectedHash)
})
