import {pick} from 'lodash-es'

const POI_FIELDS = [
  'name',
  'toponym',
  'category',
  'postcode',
  'citycode',
  'city',
  'extrafields',
  'classification'
]

export async function search(params, {db, addokCluster}) {
  const results = await addokCluster.geocode(params)

  return results.map(result => {
    const {id} = result.properties
    const storedFeature = db.getFeatureById(id)

    const properties = {
      ...pick(storedFeature.properties, POI_FIELDS),
      score: result.properties.score
    }

    if (params.returntruegeometry) {
      properties.truegeometry = JSON.stringify(storedFeature.geometry)
    }

    return {
      type: 'Feature',
      geometry: result.geometry,
      properties
    }
  })
}
