import {createGunzip} from 'node:zlib'
import got from 'got'
import {parse} from 'ndjson'
import {omit} from 'lodash-es'

export async function * extractFeatures(fileUrl) {
  const inputStream = got.stream(fileUrl)
    .pipe(createGunzip())
    .pipe(parse())

  for await (const row of inputStream) {
    if (row.type === 'street') {
      const street = omit(row, 'housenumbers')
      yield asFeature(street)

      for (const [housenumber, hnProperties] of Object.entries(row.housenumbers)) {
        yield asFeature({
          type: 'housenumber',
          housenumber,
          street: street.id,
          ...hnProperties
        })
      }
    } else {
      yield asFeature(row)
    }
  }
}

function asFeature(properties) {
  return {
    type: 'Feature',
    geometry: {type: 'Point', coordinates: [properties.lon, properties.lat]},
    properties: omit(properties, ['lon', 'lat'])
  }
}
