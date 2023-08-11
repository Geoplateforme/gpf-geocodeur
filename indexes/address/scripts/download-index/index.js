#!/usr/bin/env node
import 'dotenv/config.js'
import process from 'node:process'
import {rm, mkdir} from 'node:fs/promises'

import {downloadAndUnpack, resolveArchiveUrl} from '../../../../lib/scripts/download-index/index.js'
import {ADDRESS_INDEX_PATH} from '../../util/paths.js'

const archiveUrl = await resolveArchiveUrl(
  process.env.ADDRESS_ARCHIVE_URL,
  process.env.ADDRESS_ARCHIVE_URL_RESOLVER
)
await rm(ADDRESS_INDEX_PATH, {recursive: true, force: true})
await mkdir(ADDRESS_INDEX_PATH, {recursive: true})
await downloadAndUnpack(archiveUrl, ADDRESS_INDEX_PATH)
