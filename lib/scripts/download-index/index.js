/* eslint no-await-in-loop: off */
import {finished} from 'node:stream/promises'
import {createGunzip} from 'node:zlib'

import got from 'got'
import tarFs from 'tar-fs'

export async function resolveArchiveUrl(archiveUrl, resolverUrl) {
  if (archiveUrl) {
    console.log(`Archive à utiliser : ${archiveUrl}`)
    return archiveUrl
  }

  console.log(`Résolution à partir de l'URL : ${resolverUrl}`)
  const resolvedArchiveUrl = await got(resolverUrl).text()
  console.log(`Archive à utiliser : ${resolvedArchiveUrl}`)
  return resolvedArchiveUrl
}

export async function downloadAndUnpack(archiveUrl, destPath) {
  const extract = tarFs.extract(destPath)
  got.stream(archiveUrl).pipe(createGunzip()).pipe(extract)
  await finished(extract)
}
