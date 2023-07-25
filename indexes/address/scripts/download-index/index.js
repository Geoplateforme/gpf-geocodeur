#!/usr/bin/env node
import 'dotenv/config.js'
import process from 'node:process'
import {rm, mkdir} from 'node:fs/promises'

import {downloadAndUnpack} from '../../../../lib/scripts/download-index/index.js'
import {ADDRESS_INDEX_PATH} from '../../util/paths.js'

const {ARCHIVE_URL} = process.env

await rm(ADDRESS_INDEX_PATH, {recursive: true, force: true})
await mkdir(ADDRESS_INDEX_PATH, {recursive: true})
await downloadAndUnpack(ARCHIVE_URL, ADDRESS_INDEX_PATH)
