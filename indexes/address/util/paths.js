import path from 'node:path'
import process from 'node:process'

export const DATA_PATH = process.env.DATA_PATH
  ? path.resolve(process.env.DATA_PATH)
  : path.resolve('./data')

export const ADDRESS_INDEX_PATH = path.join(DATA_PATH, 'address', 'index')
export const ADDRESS_INDEX_MDB_PATH = path.join(ADDRESS_INDEX_PATH, 'address.mdb')
export const ADDRESS_INDEX_MDB_BASE_PATH = path.join(ADDRESS_INDEX_PATH, 'address')
export const ADDRESS_INDEX_RTREE_PATH = path.join(ADDRESS_INDEX_PATH, 'address.rtree')
