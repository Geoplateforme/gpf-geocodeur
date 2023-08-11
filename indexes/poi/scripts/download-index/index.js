#!/usr/bin/env node
import 'dotenv/config.js'
import process from 'node:process'
import {rm, mkdir} from 'node:fs/promises'

import {downloadAndUnpack, resolveArchiveUrl} from '../../../../lib/scripts/download-index/index.js'
import {POI_INDEX_PATH} from '../../util/paths.js'

const archiveUrl = await resolveArchiveUrl(
  process.env.POI_ARCHIVE_URL,
  process.env.POI_ARCHIVE_URL_RESOLVER
)
await rm(POI_INDEX_PATH, {recursive: true, force: true})
await mkdir(POI_INDEX_PATH, {recursive: true})
await downloadAndUnpack(archiveUrl, POI_INDEX_PATH)
