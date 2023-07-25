#!/usr/bin/env node
import 'dotenv/config.js'

import {packAndUpload} from '../../../../lib/scripts/publish-index/index.js'
import {POI_INDEX_PATH} from '../../util/paths.js'

await packAndUpload('poi', POI_INDEX_PATH)
