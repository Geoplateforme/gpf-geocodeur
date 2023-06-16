import centroid from '@turf/centroid'

export function transformParcel(initialFeature) {
  const {geometry: {coordinates: [lon, lat]}} = centroid(initialFeature.geometry)

  const properties = {
    id: initialFeature.properties.IDU,
    departmentcode: initialFeature.properties.CODE_DEP,
    municipalitycode: initialFeature.properties.CODE_COM,
    oldMunicipalitycode: initialFeature.properties.COM_ABS,
    districtcode: initialFeature.properties.CODE_ARR,
    section: initialFeature.properties.SECTION,
    sheet: initialFeature.properties.FEUILLE.toString().padStart(2, '0'),
    number: initialFeature.properties.NUMERO,
    lon,
    lat
  }

  return {
    type: 'Feature',
    geometry: initialFeature.geometry,
    properties
  }
}
