import process from 'node:process'
import path from 'node:path'
import {tmpdir} from 'node:os'
import {createWriteStream} from 'node:fs'
import {rm, mkdir} from 'node:fs/promises'
import {pipeline} from 'node:stream/promises'

import fg from 'fast-glob'
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

const CRS_MAPPING = {
  971: 'RGAF09UTM20',
  972: 'RGAF09UTM20',
  973: 'UTM22RGFG95',
  974: 'RGR92UTM40S',
  975: 'RGSPM06U21',
  976: 'RGM04UTM38S',
  977: 'RGAF09UTM20',
  978: 'RGAF09UTM20'
}

export function getArchiveURL(baseURL, codeDepartement) {
  if (codeDepartement.length === 2) {
    return baseURL
      .replace('{dep}', `D0${codeDepartement}`)
      .replace('{crs}', 'LAMB93')
  }

  if (!(codeDepartement in CRS_MAPPING)) {
    throw new Error('Unknown codeDepartement')
  }

  return baseURL
    .replace('{dep}', `D${codeDepartement}`)
    .replace('{crs}', CRS_MAPPING[codeDepartement])
}

export async function getPath(basePath, fileName) {
  const [filePath] = await fg(
    ['**/' + fileName],
    {absolute: true, unique: true, cwd: basePath, caseSensitiveMatch: false}
  )

  return filePath
}
