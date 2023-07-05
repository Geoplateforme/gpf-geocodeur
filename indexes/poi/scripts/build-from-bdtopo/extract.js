import {uniq, compact, mapValues, isFunction, chain} from 'lodash-es'
import gdal from 'gdal-async'
import truncate from '@turf/truncate'
import centroid from '@turf/centroid'

import {getCommune} from '../../../../lib/cog.js'

export function computeFields(originalProperties, fieldsDefinition, computedFieldsSchema) {
  return mapValues(fieldsDefinition, (resolver, fieldName) => {
    let resolvedValue = isFunction(resolver)
      ? resolver(originalProperties)
      : resolver

    if (resolvedValue === undefined) {
      return
    }

    if (computedFieldsSchema[fieldName] === Array) {
      if (!Array.isArray(resolvedValue)) {
        resolvedValue = [resolvedValue]
      }

      return uniq(compact(resolvedValue))
    }

    return resolvedValue
  })
}

export function * extractFeatures({datasetPath, layersDefinitions, cleabsUniqIndex, communesIndex, categoriesAccumulator, computedFieldsSchema}) {
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

      if (!cleabs || cleabsUniqIndex.has(cleabs)) {
        continue
      }

      cleabsUniqIndex.add(cleabs)

      // eslint-disable-next-line unicorn/no-array-callback-reference
      if (config.filter && !config.filter(properties)) {
        continue
      }

      const fields = computeFields(properties, config.fields, computedFieldsSchema)

      fields.importance = fields.classification
        ? Math.round((1 - ((fields.classification - 1) * 0.1)) * 100) / 100
        : 0.4

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

      const truncatedGeometry = truncate(geometry.toObject(), {mutate: true, coordinates: 2})
      const truncatedCentroid = truncate(centroid(truncatedGeometry), {mutate: true})
      const {geometry: {coordinates: [lon, lat]}} = truncatedCentroid

      fields.truegeometry = JSON.stringify(truncatedGeometry)
      fields.lon = lon
      fields.lat = lat

      categoriesAccumulator.addCategories(fields.category)

      yield JSON.stringify(fields) + '\n'
    }
  }

  ds.close()
}