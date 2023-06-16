import {createGunzip} from 'node:zlib'
import got from 'got'
import {parse} from 'ndjson'
import {omit} from 'lodash-es'

export async function * extractItems(fileUrl) {
  const inputStream = got.stream(fileUrl)
    .pipe(createGunzip())
    .pipe(parse())

  for await (const row of inputStream) {
    if (row.type === 'street') {
      const street = omit(row, 'housenumbers')
      yield street

      for (const [housenumber, hnProperties] of Object.entries(row.housenumbers)) {
        yield {
          type: 'housenumber',
          housenumber,
          street: street.id,
          ...hnProperties
        }
      }
    } else {
      yield row
    }
  }
}
