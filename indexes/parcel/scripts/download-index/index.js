#!/usr/bin/env node
import 'dotenv/config.js'
import process from 'node:process'
import {rm, mkdir} from 'node:fs/promises'

import {downloadAndUnpack} from '../../../../lib/scripts/download-index/index.js'
import {PARCEL_INDEX_PATH} from '../../util/paths.js'

const {ARCHIVE_URL} = process.env

await rm(PARCEL_INDEX_PATH, {recursive: true, force: true})
await mkdir(PARCEL_INDEX_PATH, {recursive: true})
await downloadAndUnpack(ARCHIVE_URL, PARCEL_INDEX_PATH)
