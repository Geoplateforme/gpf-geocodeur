import process from 'node:process'
import path from 'node:path'
import {tmpdir} from 'node:os'
import {createWriteStream} from 'node:fs'
import {mkdtemp, rm} from 'node:fs/promises'
import {pipeline} from 'node:stream/promises'

import got from 'got'
import {execa} from 'execa'

const TMP_PATH = process.env.TMP_PATH
  ? path.resolve(process.env.TMP_PATH)
  : tmpdir

export async function downloadAndExtractToTemp(url) {
  const tmpDirPath = await mkdtemp(path.join(TMP_PATH, 'archive-'))
  const archivePath = path.join(tmpDirPath, 'archive.7z')

  await pipeline(
    got.stream(url),
    createWriteStream(archivePath)
  )

  await execa('7z', ['x', archivePath], {cwd: tmpDirPath})
  await rm(archivePath)

  return tmpDirPath
}
