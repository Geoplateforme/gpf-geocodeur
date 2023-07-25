#!/usr/bin/env node
import 'dotenv/config.js'

import {packAndUpload} from '../../../../lib/scripts/publish-index/index.js'
import {ADDRESS_INDEX_PATH} from '../../util/paths.js'

await packAndUpload('address', ADDRESS_INDEX_PATH)
