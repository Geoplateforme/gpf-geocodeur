import process from 'node:process'

const {BDTOPO_URL} = process.env

const CRS_MAPPING = {
  971: 'RGAF09UTM20',
  972: 'RGAF09UTM20',
  973: 'UTM22RGFG95',
  974: 'RGR92UTM40S',
  975: 'RGSPM06U21',
  976: 'RGM04UTM38S',
  977: 'RGAF09UTM20',
  978: 'RGAF09UTM20'
}

export function getArchiveURL(codeDepartement) {
  if (codeDepartement.length === 2) {
    return BDTOPO_URL
      .replace('{dep}', `D0${codeDepartement}`)
      .replace('{crs}', 'LAMB93')
  }

  if (!(codeDepartement in CRS_MAPPING)) {
    throw new Error('Unknown codeDepartement')
  }

  return BDTOPO_URL
    .replace('{dep}', `D${codeDepartement}`)
    .replace('{crs}', CRS_MAPPING[codeDepartement])
}
