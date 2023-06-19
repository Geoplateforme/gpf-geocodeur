import Flatbush from 'flatbush'
import readBigFile from '../../../lib/spatial-index/read-big-file.js'

import {PARCEL_INDEX_RTREE_PATH} from '../util/paths.js'

export async function createRtree() {
  console.time('R-Tree index loaded')
  const rtreeIndexData = await readBigFile(PARCEL_INDEX_RTREE_PATH)
  const rtreeIndex = Flatbush.from(rtreeIndexData)
  console.timeEnd('R-Tree index loaded')
  return rtreeIndex
}
