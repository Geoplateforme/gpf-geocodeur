import {createReadStream} from 'node:fs'
import {parse} from 'ndjson'
import {omit} from 'lodash-es'

export async function * extractFeatures(filePath) {
  const inputStream = createReadStream(filePath)
    .pipe(parse())

  for await (const row of inputStream) {
    yield asFeature(row)
  }
}

function asFeature(poiEntry) {
  const properties = omit(poiEntry, ['truegeometry'])
  const geometry = JSON.parse(poiEntry.truegeometry)

  return {
    type: 'Feature',
    geometry,
    properties
  }
}
