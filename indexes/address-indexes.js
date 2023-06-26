export default function getAddressIndexes() {
  return (
    {
      id: 'address',
      description: 'adresses postales',
      metadataurl: '',
      fields: [
        {
          name: 'id',
          description: 'identifiant de l’adresse (clef d’interopérabilité)',
          type: 'string',
          queryable: false,
          filter: false
        },
        {
          name: 'type',
          description: 'type de résultat trouvé (housenumber, street, locality, municipality)',
          type: 'string',
          queryable: true,
          filter: true,
          values: [
            'housenumber',
            'street',
            'locality',
            'municipality'
          ]
        },
        {
          name: 'score',
          description: 'valeur de 0 à 1 indiquant la pertinence du résultat',
          type: 'string',
          queryable: false,
          filter: false
        },
        {
          name: 'housenumber',
          description: 'numéro avec indice de répétition éventuel (bis, ter, A, B)',
          type: 'string',
          queryable: true,
          filter: false
        },
        {
          name: 'street',
          description: 'nom de la voie',
          type: 'string',
          queryable: true,
          filter: false
        },
        {
          name: 'name',
          description: 'numéro éventuel et nom de voie ou lieu dit',
          type: 'string',
          queryable: false,
          filter: false
        },
        {
          name: 'postcode',
          description: 'code postal',
          type: 'string',
          queryable: true,
          filter: true
        },
        {
          name: 'citycode',
          description: 'code INSEE de la commune',
          type: 'string',
          queryable: true,
          filter: true
        },
        {
          name: 'city',
          description: 'nom de la commune',
          type: 'string',
          queryable: true,
          filter: true
        },
        {
          name: 'district',
          description: 'nom de l’arrondissement (Paris/Lyon/Marseille)',
          type: 'string',
          queryable: false,
          filter: false
        },
        {
          name: 'oldcitycode',
          description: 'code INSEE de la commune ancienne (le cas échéant)',
          type: 'string',
          queryable: false,
          filter: false
        },
        {
          name: 'oldcity',
          description: 'nom de la commune ancienne (le cas échéant)',
          type: 'string',
          queryable: false,
          filter: false
        },
        {
          name: 'context',
          description: 'n° de département, nom de département et de région',
          type: 'string',
          queryable: false,
          filter: false
        },
        {
          name: 'label',
          description: 'libellé complet de l’adresse',
          type: 'string',
          queryable: false,
          filter: false
        },
        {
          name: 'x',
          description: 'coordonnées géographique en projection légale',
          type: 'string',
          queryable: false,
          filter: false
        },
        {
          name: 'y',
          description: 'coordonnées géographique en projection légale',
          type: 'string',
          queryable: false,
          filter: false
        },
        {
          name: 'importance',
          description: 'indicateur d’importance (champ technique)',
          type: 'string',
          queryable: false,
          filter: false
        }
      ]
    }
  )
}
