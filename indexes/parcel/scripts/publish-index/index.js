#!/usr/bin/env node
import 'dotenv/config.js'
import path from 'node:path'

import {packAndUpload} from '../../../../lib/scripts/publish-index/index.js'

await packAndUpload('parcel', path.resolve('./data/parcel/index'))
