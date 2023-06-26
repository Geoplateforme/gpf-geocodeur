export default function getParcelIndexes() {
  return (
    {
      id: 'parcel',
      description: 'parcelles cadastrales',
      metadataurl: '',
      fields: [
        {
          name: 'id',
          description: 'l\'identifiant de la parcelle',
          type: 'string',
          queryable: true,
          filter: false
        },
        {
          name: 'departmentcode',
          description: 'le code du département',
          type: 'string',
          queryable: true,
          filter: true
        },
        {
          name: 'municipalitycode',
          description: 'le code insee de la commune',
          type: 'string',
          queryable: true,
          filter: true
        },
        {
          name: 'city',
          description: 'le nom de la commune',
          type: 'string',
          queryable: true,
          filter: true
        },
        {
          name: 'oldmunicipalitycode',
          description: 'le code insee de la commune absorbée',
          type: 'string',
          queryable: true,
          filter: true
        },
        {
          name: 'districtcode',
          description: 'le code insee de l\'arrondissement',
          type: 'string',
          queryable: true,
          filter: true
        },
        {
          name: 'section',
          description: 'le code de la section cadastrale',
          type: 'string',
          queryable: true,
          filter: true
        },
        {
          name: 'number',
          description: 'le numéro de la parcelle',
          type: 'string',
          queryable: true,
          filter: true
        },
        {
          name: 'sheet',
          description: 'le numero de la feuille cadastrale',
          type: 'string',
          queryable: true,
          filter: true
        },
        {
          name: 'truegeometry',
          description: 'la géométrie de la parcelle',
          type: 'string',
          queryable: false,
          filter: false
        }
      ]
    }
  )
}
