/* eslint array-element-newline: off, no-await-in-loop: off */
import 'dotenv/config.js'

import path from 'node:path'
import process from 'node:process'
import {finished} from 'node:stream/promises'
import {Readable} from 'node:stream'
import {createWriteStream} from 'node:fs'
import {rm, mkdir} from 'node:fs/promises'

import gdal from 'gdal-async'
import {mapValues, isFunction, uniq, compact, chain} from 'lodash-es'
import truncate from '@turf/truncate'

import {downloadAndExtractToTmp} from '../../../../lib/build/extract.js'
import {getArchiveURL} from '../../../../lib/build/ign.js'
import {getPath} from '../../../../lib/build/path.js'
import {getCommune} from '../../../../lib/cog.js'

import {POI_DATA_PATH} from '../../util/paths.js'

import LAYERS from './mapping.js'
import {createCommunesIndex} from './communes.js'

const ALL_DEPARTEMENTS = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09',
  '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '2A', '2B', '21', '22', '23', '24', '25', '26', '27', '28', '29',
  '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
  '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',
  '60', '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '70', '71', '72', '73', '74', '75', '76', '77', '78', '79',
  '80', '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '90', '91', '92', '93', '94', '95',
  '971', '972', '973', '974', '975', '976', '977', '978'
]

const DEPARTEMENTS = process.env.DEPARTEMENTS
  ? process.env.DEPARTEMENTS.split(',')
  : ALL_DEPARTEMENTS

const {BDTOPO_URL} = process.env

const communesIndex = await createCommunesIndex()
const cleabsUniqIndex = new Set()

function computeFields(originalProperties, fieldsDefinition) {
  const fields = mapValues(fieldsDefinition, (resolver, _fieldName) => {
    if (isFunction(resolver)) {
      let resolvedValue = resolver(originalProperties)

      if (!Array.isArray(resolvedValue)) {
        resolvedValue = [resolvedValue]
      }

      return uniq(compact(resolvedValue))
    }

    return resolver
  })

  fields.importance = fields.classification
    ? Math.round((1 - ((fields.classification - 1) * 0.1)) * 100) / 100
    : 0.4

  return fields
}

function * readFeatures(datasetPath, layersDefinitions) {
  const ds = gdal.open(datasetPath)
  const wgs84 = gdal.SpatialReference.fromProj4('+init=epsg:4326')

  for (const [layerName, config] of Object.entries(layersDefinitions)) {
    let layer

    try {
      layer = ds.layers.get(layerName)
    } catch {
      continue
    }

    console.log(` * ${layerName}`)

    const transformation = new gdal.CoordinateTransformation(layer.srs, wgs84)

    for (const feature of layer.features) {
      const properties = feature.fields.toObject()
      const {cleabs} = properties

      if (cleabsUniqIndex.has(cleabs)) {
        continue
      }

      // eslint-disable-next-line unicorn/no-array-callback-reference
      if (config.filter && !config.filter(properties)) {
        continue
      }

      const fields = computeFields(properties, config.fields)

      fields.extrafields = {
        cleabs
      }

      let geometry = feature.getGeometry()
      geometry.transform(transformation)

      if (config.simplification) {
        geometry = geometry.simplifyPreserveTopology(config.simplification)
      }

      if (config.computeCommunes) {
        const citycode = communesIndex.getIntersectingCommunes(geometry)
        const communes = citycode.map(c => getCommune(c)).filter(Boolean)

        const depcode = chain(communes).map('departement').compact().uniq().value()
        const postcode = chain(communes).map('codesPostaux').compact().flatten().uniq().value()
        const city = chain(communes).map('nom').compact().uniq().value()

        fields.citycode = [...citycode, ...depcode]
        fields.city = city
        fields.postcode = postcode
      }

      const truegeometry = JSON.stringify(truncate(geometry.toObject(), {mutate: true, coordinates: 2}))

      yield JSON.stringify({
        ...fields,
        truegeometry
      }) + '\n'
    }
  }

  ds.close()
}

await mkdir(POI_DATA_PATH, {recursive: true})
const outputFile = createWriteStream(path.join(POI_DATA_PATH, 'poi.ndjson'), {encoding: 'utf8'})

for (const codeDepartement of DEPARTEMENTS) {
  console.log(codeDepartement)

  const archiveUrl = getArchiveURL(BDTOPO_URL, codeDepartement)
  const archiveDirPath = await downloadAndExtractToTmp(archiveUrl)
  const datasetPath = await getPath(archiveDirPath, 'BDT_3-3_GPKG_*.gpkg')

  const featureStream = Readable.from(readFeatures(datasetPath, LAYERS))
  featureStream.pipe(outputFile, {end: false})
  await finished(featureStream)

  await rm(archiveDirPath, {recursive: true})
}

outputFile.end()
await finished(outputFile)

await communesIndex.close()
