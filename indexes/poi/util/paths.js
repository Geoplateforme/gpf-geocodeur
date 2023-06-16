import path from 'node:path'
import process from 'node:process'

export const DATA_PATH = process.env.DATA_PATH
  ? path.resolve(process.env.DATA_PATH)
  : path.resolve('./data')

export const POI_DATA_PATH = path.join(DATA_PATH, 'poi', 'data')
export const POI_INDEX_PATH = path.join(DATA_PATH, 'poi', 'index')
export const POI_INDEX_MDB_PATH = path.join(POI_INDEX_PATH, 'poi.mdb')
export const POI_INDEX_RTREE_PATH = path.join(POI_INDEX_PATH, 'poi.rtree')
