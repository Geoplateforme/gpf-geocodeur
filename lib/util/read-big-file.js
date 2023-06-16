import {createReadStream} from 'node:fs'
import {stat} from 'node:fs/promises'

const READ_FILE_CHUNK_SIZE = 64 * 1024 * 1024 // 64MB

async function readBigFile(filePath, ArrayBufferType = ArrayBuffer) {
  const {size: fileSize} = await stat(filePath)

  const arrayBuffer = new ArrayBufferType(fileSize)
  const view = new Uint8Array(arrayBuffer)

  const fileReadStream = createReadStream(
    filePath,
    {highWaterMark: READ_FILE_CHUNK_SIZE}
  )

  let offset = 0

  for await (const chunk of fileReadStream) {
    for (const [i, element] of chunk.entries()) {
      view[offset + i] = element
    }

    offset += chunk.length
  }

  return arrayBuffer
}

export default readBigFile
