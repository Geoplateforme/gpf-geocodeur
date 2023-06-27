export default function getPOICapabilities() {
  return (
    {
      id: 'poi',
      description: 'points d\'intérêt',
      metadataurl: '',
      fields: [
        {
          name: 'category',
          description: 'le type du lieu',
          type: 'string',
          queryable: true,
          filter: true
        },
        {
          name: 'toponyme',
          description: 'le toponyme',
          type: 'string',
          queryable: true,
          filter: false
        },
        {
          name: 'postcode',
          description: 'le code postal',
          type: 'string',
          queryable: true,
          filter: true
        },
        {
          name: 'citycode',
          description: 'le code insee',
          type: 'string',
          queryable: true,
          filter: true
        },
        {
          name: 'city',
          description: 'le nom de la commune',
          type: 'string',
          queryable: false,
          filter: false
        },
        {
          name: 'extrafields',
          description: 'les champs supplémentaires',
          type: 'string',
          queryable: false,
          filter: false
        },
        {
          name: 'truegeometry',
          description: 'la géométrie réelle',
          type: 'string',
          queryable: false,
          filter: false
        }
      ]
    }
  )
}
