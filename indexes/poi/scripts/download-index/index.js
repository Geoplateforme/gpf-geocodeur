#!/usr/bin/env node
import 'dotenv/config.js'
import process from 'node:process'
import {rm, mkdir} from 'node:fs/promises'

import {downloadAndUnpack} from '../../../../lib/scripts/download-index/index.js'
import {POI_INDEX_PATH} from '../../util/paths.js'

const {ARCHIVE_URL} = process.env

await rm(POI_INDEX_PATH, {recursive: true, force: true})
await mkdir(POI_INDEX_PATH, {recursive: true})
await downloadAndUnpack(ARCHIVE_URL, POI_INDEX_PATH)
