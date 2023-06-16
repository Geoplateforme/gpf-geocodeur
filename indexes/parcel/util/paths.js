import path from 'node:path'
import process from 'node:process'

export const DATA_PATH = process.env.DATA_PATH
  ? path.resolve(process.env.DATA_PATH)
  : path.resolve('./data')

export const PARCEL_INDEX_PATH = path.join(DATA_PATH, 'parcel', 'index')
export const PARCEL_INDEX_MDB_PATH = path.join(PARCEL_INDEX_PATH, 'parcel.mdb')
export const PARCEL_INDEX_RTREE_PATH = path.join(PARCEL_INDEX_PATH, 'parcel.rtree')
