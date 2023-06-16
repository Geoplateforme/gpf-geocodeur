import process from 'node:process'
import path from 'node:path'
import {tmpdir} from 'node:os'
import {createWriteStream} from 'node:fs'
import {rm, mkdir} from 'node:fs/promises'
import {pipeline} from 'node:stream/promises'

import {nanoid} from 'nanoid'
import got from 'got'
import {execa} from 'execa'

const TMP_PATH = process.env.TMP_PATH
  ? path.resolve(process.env.TMP_PATH)
  : tmpdir

export async function downloadAndExtractToTmp(url) {
  const id = nanoid(6)
  const tmpDirPath = path.join(TMP_PATH, `archive-${id}`)
  await mkdir(tmpDirPath, {recursive: true})
  const archivePath = path.join(tmpDirPath, 'archive.7z')

  await pipeline(
    got.stream(url),
    createWriteStream(archivePath)
  )

  await execa('7z', ['x', archivePath], {cwd: tmpDirPath})
  await rm(archivePath)

  return tmpDirPath
}
