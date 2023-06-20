import Flatbush from 'flatbush'
import readBigFile from './read-big-file.js'

export async function createRtree(rtreePath) {
  console.time('R-Tree index loaded')
  const rtreeIndexData = await readBigFile(rtreePath)
  const rtreeIndex = Flatbush.from(rtreeIndexData)
  console.timeEnd('R-Tree index loaded')
  return rtreeIndex
}
