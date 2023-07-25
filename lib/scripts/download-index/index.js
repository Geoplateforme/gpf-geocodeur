/* eslint no-await-in-loop: off */
import {finished} from 'node:stream/promises'
import {createGunzip} from 'node:zlib'

import got from 'got'
import tarFs from 'tar-fs'

export async function downloadAndUnpack(archiveUrl, destPath) {
  const extract = tarFs.extract(destPath)
  got.stream(archiveUrl).pipe(createGunzip()).pipe(extract)
  await finished(extract)
}
