/* eslint camelcase: off, curly: off, object-shorthand: off */
import {getCodesCommunesMembresEpci} from '../../../../lib/cog.js'

export const MAIN_CATEGORIES = [
  'cimetière',
  'réservoir',
  'administratif',
  'construction',
  'hydrographie',
  'élément topographique ou forestier',
  'transport',
  'poste de transformation',
  'zone d\'activité ou d\'intérêt',
  'zone d\'habitation'
]

export const COMPUTED_FIELDS_SCHEMA = {
  name: Array,
  toponym: String,
  category: Array,
  classification: Number,
  postcode: Array,
  citycode: Array,
  city: Array
}

export const LAYERS = {
  cimetiere: {
    fields: {
      name: ({toponyme, nature}) => toponyme || (nature && `Cimetière ${nature.toLowerCase()}`) || 'Cimetière',
      toponym: ({toponyme}) => toponyme || 'Cimetière',
      category: 'cimetière',
      classification: ({importance}) => {
        if (importance === '1') return 4
        if (importance >= '2' && importance <= '4') return 5
        return 7
      }
    },
    extrafields: {
      nature_detaillee: ({nature_detaillee}) => nature_detaillee || ''
    },
    computeCommunes: true
  },

  reservoir: {
    filter: ({nature}) => Boolean(nature),
    fields: {
      name: ({nature}) => (nature !== 'Inconnue' && nature) || 'Réservoir',
      toponym: ({nature}) => (nature !== 'Inconnue' && nature) || 'Réservoir',
      category: ({nature}) => [nature !== 'Inconnue' && nature.toLowerCase(), 'réservoir'],
      classification: 7
    },
    computeCommunes: true
  },

  terrain_de_sport: {
    filter: ({nature}) => Boolean(nature),
    fields: {
      name: ({nature, nature_detaillee}) => nature_detaillee || nature || 'Terrain de sport',
      toponym: ({nature, nature_detaillee}) => nature_detaillee || nature || 'Terrain de sport',
      category: ({nature, nature_detaillee}) => [
        nature && nature.toLowerCase(),
        nature_detaillee && nature_detaillee.toLowerCase(),
        'terrain de sport'
      ],
      classification: 7
    },
    computeCommunes: true
  },

  construction_lineaire: {
    filter: ({nature}) => ['Ruine', 'Barrage', 'Sport de montagne', 'Pont'].includes(nature),
    fields: {
      name: ({toponyme, nature, nature_detaillee}) => toponyme || nature_detaillee || nature || 'Construction linéaire',
      toponym: ({toponyme, nature, nature_detaillee}) => toponyme || nature_detaillee || nature || 'Construction linéaire',
      category: ({nature, nature_detaillee}) => [
        ['Ruine', 'Barrage'].includes(nature) && nature.toLowerCase(),
        ['Pont', 'Sport de montagne'].includes(nature) && ((nature_detaillee && nature_detaillee.toLowerCase()) || nature.toLowerCase()),
        'construction',
        'construction linéaire'
      ],
      classification: 7
    },
    computeCommunes: true
  },

  poste_de_transformation: {
    fields: {
      name: ({toponyme}) => toponyme || 'Poste de transformation',
      toponym: ({toponyme}) => toponyme || 'Poste de transformation',
      category: 'poste de transformation',
      classification: 7
    }
  },

  construction_ponctuelle: {
    filter: ({nature}) => nature && !['Minaret', 'Eolienne', 'Antenne', 'Transformateur', 'Cheminée', 'Puits d\'hydrocarbures', 'Torchère'].includes(nature),
    fields: {
      name: ({toponyme, nature, nature_detaillee}) => toponyme || nature_detaillee || nature || 'Construction ponctuelle',
      toponym: ({toponyme, nature, nature_detaillee}) => toponyme || nature_detaillee || nature || 'Construction ponctuelle',
      category: ({nature}) => [
        nature.toLowerCase(),
        'construction',
        'construction ponctuelle'
      ],
      classification: 7
    },
    computeCommunes: true
  },

  construction_surfacique: {
    filter: ({nature}) => nature && !['Escalier'].includes(nature),
    fields: {
      name: ({toponyme, nature, nature_detaillee}) => toponyme || nature_detaillee || nature || 'Construction surfacique',
      toponym: ({toponyme, nature, nature_detaillee}) => toponyme || nature_detaillee || nature || 'Construction surfacique',
      category: ({nature}) => [
        nature.toLowerCase(),
        'construction',
        'construction surfacique'
      ],
      classification: 7
    },
    computeCommunes: true
  },

  transport_par_cable: {
    filter: ({nature}) => nature && !['Autre remontée mécanique', 'Téléski', 'Télésiège'].includes(nature),
    fields: {
      name: ({toponyme, nature, nature_detaillee}) => toponyme || nature_detaillee || nature || 'Transport par câble',
      toponym: ({toponyme, nature, nature_detaillee}) => toponyme || nature_detaillee || nature || 'Transport par câble',
      category: ({nature}) => [
        nature.toLowerCase(),
        'transport',
        'transport par câble'
      ],
      classification: 7
    },
    computeCommunes: true
  },

  aerodrome: {
    filter: ({nature}) => Boolean(nature) && !['Hydrobase'].includes(nature),
    fields: {
      name: ({toponyme, nature}) => toponyme || nature || 'Aérodrome',
      toponym: ({toponyme}) => toponyme || 'Aérodrome',
      category: ({nature}) => [
        nature && nature.toLowerCase(),
        'transport',
        'aérodrome'
      ],
      classification: 7
    },
    computeCommunes: true
  },

  equipement_de_transport: {
    filter: ({nature}) => Boolean(nature) && !['Carrefour', 'Tour de contrôle aérien', 'Autre équipement', 'Péage'].includes(nature),
    fields: {
      name: ({toponyme, nature, nature_detaillee}) => toponyme || nature_detaillee || nature || 'Équipement de transport',
      toponym: ({toponyme, nature_detaillee}) => toponyme || nature_detaillee || 'Équipement de transport',
      category: ({nature}) => [
        nature && nature.toLowerCase(),
        'transport',
        'équipement de transport'
      ],
      classification: 7
    },
    computeCommunes: true
  },

  detail_orographique: {
    filter: ({nature}) => Boolean(nature) && !['Versant'].includes(nature),
    fields: {
      name: ({toponyme, nature}) => toponyme || nature || 'Détail orographique',
      toponym: ({toponyme}) => toponyme || 'Détail orographique',
      category: ({nature}) => [
        nature && nature.toLowerCase(),
        'élément topographique ou forestier',
        'détail orographique'
      ],
      classification: ({importance}) => {
        if (importance === '1' || importance === '2') return 3
        if (importance === '3') return 4
        return 8
      }
    },
    computeCommunes: true
  },

  zone_d_habitation: {
    filter: ({nature}) => Boolean(nature),
    fields: {
      name: ({toponyme, nature, nature_detaillee}) => toponyme || nature_detaillee || nature || 'Zone d\'habitation',
      toponym: ({toponyme}) => toponyme || 'Zone d\'habitation',
      category: ({nature}) => [
        nature && nature.toLowerCase(),
        'zone d\'habitation'
      ],
      classification: 7
    },
    computeCommunes: true
  },

  cours_d_eau: {
    fields: {
      name: ({toponyme}) => toponyme || 'Cours d\'eau',
      toponym: ({toponyme}) => toponyme || 'Cours d\'eau',
      category: [
        'cours d\'eau',
        'hydrographie'
      ],
      classification: 7
    },
    computeCommunes: true
  },

  detail_hydrographique: {
    filter: ({nature}) => Boolean(nature) && !['Amer', 'Cascade', 'Citerne'].includes(nature),
    fields: {
      name: ({toponyme, nature}) => toponyme || nature || 'Détail hydrographique',
      toponym: ({toponyme}) => toponyme || 'Détail hydrographique',
      category: ({nature}) => [
        nature && nature.toLowerCase(),
        'détail hydrographique',
        'hydrographie'
      ],
      classification: 7
    },
    computeCommunes: true
  },

  plan_d_eau: {
    filter: ({nature}) => Boolean(nature),
    fields: {
      name: ({toponyme, nature}) => toponyme || nature || 'Plan d\'eau',
      toponym: ({toponyme}) => toponyme || 'Plan d\'eau',
      category: ({nature}) => [
        nature && nature.toLowerCase(),
        'plan d\'eau',
        'hydrographie'
      ],
      classification: 7
    },
    computeCommunes: true
  },

  zone_d_activite_ou_d_interet: {
    filter: ({nature}) => Boolean(nature) && !['Usine de production d\'eau potable', 'Abri de montagne', 'Aire d\'accueil des gens du voyage', 'Aire de détente', 'Aquaculture', 'Autre équipement sportif', 'Borne', 'Borne frontière', 'Carrière', 'Centrale électrique', 'Centre de documentation', 'Champ de tir', 'Départ de ski de fond', 'Elevage', 'Enceinte militaire', 'Espace public', 'Point de vue', 'Salle de danse ou de jeux', 'Salle de spectacle ou conférence', 'Science', 'Sports en eaux vives', 'Sports mécaniques', 'Sports nautiques', 'Station de pompage', 'Station d\'épuration', 'Surveillance maritime', 'Vestige archéologique'].includes(nature),
    fields: {
      name: ({toponyme, nature, nature_detaillee}) => toponyme || nature_detaillee || nature || 'Zone d\'activité ou d\'intérêt',
      toponym: ({toponyme, nature_detaillee}) => toponyme || nature_detaillee || 'Zone d\'activité ou d\'intérêt',
      category: ({nature}) => [
        nature && nature.toLowerCase(),
        'zone d\'activité ou d\'intérêt'
      ],
      classification: ({importance}) => {
        if (importance === '1') return 1
        if (importance === '2') return 2
        if (importance === '3') return 4
        if (importance === '4') return 7
        return 9
      }
    },
    computeCommunes: true
  },

  lieu_dit_non_habite: {
    filter: ({nature}) => Boolean(nature),
    fields: {
      name: ({toponyme, nature}) => toponyme || nature || 'Lieu-dit non habité',
      toponym: ({toponyme}) => toponyme || 'Lieu-dit non habité',
      category: ({nature}) => [
        nature && nature.toLowerCase(),
        'élément topographique ou forestier',
        'lieu-dit non habité'
      ],
      classification: 7
    },
    computeCommunes: true
  },

  commune: {
    fields: {
      name: ({nom_officiel}) => nom_officiel,
      toponym: ({nom_officiel}) => nom_officiel,
      category: ['administratif', 'commune'],
      postcode: ({code_postal}) => code_postal,
      citycode: ({code_insee, code_insee_du_departement}) => [
        code_insee,
        code_insee_du_departement
      ],
      classification: ({capitale_d_etat, chef_lieu_de_region, chef_lieu_de_departement, chef_lieu_d_arrondissement, chef_lieu_de_collectivite_terr, population}) => {
        if (capitale_d_etat) return 1

        const chefLieu = chef_lieu_de_region
          || chef_lieu_de_departement
          || chef_lieu_d_arrondissement
          || chef_lieu_de_collectivite_terr

        let classification

        if (population >= 100_000) classification = 1
        else if (population >= 10_000) classification = 2
        else if (population >= 1000) classification = 3
        else classification = 4

        return Math.max(1, classification - (chefLieu ? 1 : 0))
      }
    },
    extrafields: {
      population: ({population}) => typeof population === 'number' ? population.toString() : '',
      status: ({capitale_d_etat, chef_lieu_de_region, chef_lieu_de_departement, chef_lieu_d_arrondissement, chef_lieu_de_collectivite_terr}) => {
        if (capitale_d_etat) {
          return 'capitale d\'état'
        }

        if (chef_lieu_de_region) {
          return 'chef-lieu de région'
        }

        if (chef_lieu_de_departement) {
          return 'chef-lieu de département'
        }

        if (chef_lieu_d_arrondissement) {
          return 'chef-lieu d\'arrondissement'
        }

        if (chef_lieu_de_collectivite_terr) {
          return 'chef-lieu de collectivité territoriale'
        }

        return ''
      }
    },
    simplification: 0.0002
  },

  arrondissement_municipal: {
    fields: {
      name: ({nom_officiel}) => nom_officiel,
      toponym: ({nom_officiel}) => nom_officiel,
      category: ['administratif', 'arrondissement municipal'],
      postcode: ({code_postal}) => code_postal,
      citycode: ({code_insee, code_insee_de_la_commune_de_rattach}) => [
        code_insee,
        code_insee_de_la_commune_de_rattach
      ],
      city: ({nom_officiel}) => nom_officiel,
      classification: 2
    },
    extrafields: {
      population: ({population}) => typeof population === 'number' ? population.toString() : ''
    },
    simplification: 0.0002
  },

  epci: {
    fields: {
      name: ({nom_officiel}) => nom_officiel,
      toponym: ({nom_officiel}) => nom_officiel,
      category: ['administratif', 'epci'],
      classification: 2
    },
    extrafields: {
      codes_insee_des_communes_membres: ({code_siren}) => getCodesCommunesMembresEpci(code_siren)
    },
    simplification: 0.0005
  },

  departement: {
    fields: {
      name: ({nom_officiel}) => nom_officiel,
      toponym: ({nom_officiel}) => nom_officiel,
      category: ['administratif', 'département'],
      citycode: ({code_insee}) => code_insee,
      classification: 1
    },
    simplification: 0.0005
  },

  region: {
    fields: {
      name: ({nom_officiel}) => nom_officiel,
      toponym: ({nom_officiel}) => nom_officiel,
      category: ['administratif', 'région'],
      citycode: ({code_insee}) => [code_insee],
      classification: 1
    },
    simplification: 0.0005
  }
}
