/* eslint camelcase: off */

import test from 'ava'
import {
  LAYERS
} from '../mapping.js'

test('LAYERS / cimetiere', t => {
  const {fields} = LAYERS.cimetiere
  const {name, toponym, classification} = fields

  t.is(name({toponyme: 'Cimetière Saint-Joseph', nature: 'Militaire'}), 'Cimetière Saint-Joseph')
  t.is(name({toponyme: '', nature: 'Militaire'}), 'Cimetière militaire')
  t.is(name({toponyme: 'Cimetière Saint-Joseph', nature: ''}), 'Cimetière Saint-Joseph')
  t.is(name({toponyme: '', nature: ''}), 'Cimetière')

  t.is(toponym({toponyme: 'Cimetière Saint-Joseph'}), 'Cimetière Saint-Joseph')
  t.is(toponym({toponyme: ''}), 'Cimetière')

  t.is(classification({importance: '1'}), 4)
  t.is(classification({importance: '2'}), 5)
  t.is(classification({importance: '3'}), 5)
  t.is(classification({importance: '4'}), 5)
  t.is(classification({importance: '5'}), 7)
})

test('LAYERS / reservoir', t => {
  const {filter, fields, computeCommunes} = LAYERS.reservoir
  const {name, toponym, category, classification} = fields

  t.true(filter({nature: 1}))
  t.true(filter({nature: true}))
  t.true(filter({nature: 'foo'}))
  t.true(filter({nature: 'false'}))
  t.false(filter({nature: 0}))
  t.false(filter({nature: false}))

  t.is(name({nature: 'Lac'}), 'Lac')
  t.is(name({nature: 'Inconnue'}), 'Réservoir')
  t.is(name({nature: ''}), 'Réservoir')

  t.is(toponym({nature: 'Lac'}), 'Lac')
  t.is(toponym({nature: 'Inconnue'}), 'Réservoir')
  t.is(toponym({nature: ''}), 'Réservoir')

  t.deepEqual(category({nature: 'Lac'}), ['lac', 'réservoir'])
  t.deepEqual(category({nature: 'Inconnue'}), [false, 'réservoir'])

  t.is(classification, 7)
  t.true(computeCommunes)
})

test('LAYERS / terrain_de_sport', t => {
  const {filter, fields, computeCommunes} = LAYERS.terrain_de_sport
  const {name, toponym, category, classification} = fields

  t.true(filter({nature: 1}))
  t.true(filter({nature: true}))
  t.true(filter({nature: 'foo'}))
  t.true(filter({nature: 'false'}))
  t.false(filter({nature: 0}))
  t.false(filter({nature: false}))

  t.is(name({nature: 'Football', nature_detaillee: 'Stade'}), 'Stade')
  t.is(name({nature: 'Basketball'}), 'Basketball')
  t.is(name({nature: '', nature_detaillee: 'Tennis'}), 'Tennis')
  t.is(name({nature: '', nature_detaillee: ''}), 'Terrain de sport')

  t.is(toponym({nature: 'Football', nature_detaillee: 'Stade'}), 'Stade')
  t.is(toponym({nature: 'Basketball'}), 'Basketball')
  t.is(toponym({nature: '', nature_detaillee: 'Tennis'}), 'Tennis')
  t.is(toponym({nature: '', nature_detaillee: ''}), 'Terrain de sport')

  t.deepEqual(category({nature: 'Football', nature_detaillee: 'Stade'}), [
    'football',
    'stade',
    'terrain de sport'
  ])
  t.deepEqual(category({nature: 'Basketball', nature_detaillee: 'Gymnase'}), [
    'basketball',
    'gymnase',
    'terrain de sport'
  ])
  t.deepEqual(category({nature: '', nature_detaillee: 'Tennis'}), [
    '',
    'tennis',
    'terrain de sport'
  ])
  t.deepEqual(category({nature: '', nature_detaillee: ''}), ['', '', 'terrain de sport'])

  t.is(classification, 7)
  t.true(computeCommunes)
})

test('LAYERS / construction_lineaire', t => {
  const {filter, fields, computeCommunes} = LAYERS.construction_lineaire
  const {name, toponym, category, classification} = fields

  t.true(filter({nature: 'Ruine'}))
  t.true(filter({nature: 'Barrage'}))
  t.true(filter({nature: 'Sport de montagne'}))
  t.true(filter({nature: 'Pont'}))
  t.false(filter({nature: 'Route'}))
  t.false(filter({nature: ''}))

  t.is(name({toponyme: 'Ruine A', nature: 'Ruine', nature_detaillee: 'Ancienne église'}), 'Ruine A')
  t.is(name({toponyme: '', nature: 'Barrage', nature_detaillee: 'Barrage X'}), 'Barrage X')
  t.is(name({toponyme: '', nature: 'Sport de montagne', nature_detaillee: 'Piste de ski'}), 'Piste de ski')
  t.is(name({toponyme: '', nature: 'Pont', nature_detaillee: ''}), 'Pont')
  t.is(name({toponyme: '', nature: '', nature_detaillee: ''}), 'Construction linéaire')

  t.is(toponym({toponyme: 'Ruine A', nature: 'Ruine', nature_detaillee: 'Ancienne église'}), 'Ruine A')
  t.is(toponym({toponyme: '', nature: 'Barrage', nature_detaillee: 'Barrage X'}), 'Barrage X')
  t.is(toponym({toponyme: '', nature: 'Sport de montagne', nature_detaillee: 'Piste de ski'}), 'Piste de ski')
  t.is(toponym({toponyme: '', nature: 'Pont', nature_detaillee: ''}), 'Pont')
  t.is(toponym({toponyme: '', nature: '', nature_detaillee: ''}), 'Construction linéaire')

  t.deepEqual(category({nature: 'Ruine', nature_detaillee: 'Ancienne église'}), [
    'ruine',
    false,
    'construction',
    'construction linéaire'
  ])
  t.deepEqual(category({nature: 'Barrage', nature_detaillee: 'Barrage X'}), [
    'barrage',
    false,
    'construction',
    'construction linéaire'
  ])
  t.deepEqual(category({nature: 'Sport de montagne', nature_detaillee: 'Piste de ski'}), [
    false,
    'piste de ski',
    'construction',
    'construction linéaire'
  ])
  t.deepEqual(category({nature: 'Pont', nature_detaillee: ''}), [false, 'pont', 'construction', 'construction linéaire'])
  t.deepEqual(category({nature: '', nature_detaillee: ''}), [false, false, 'construction', 'construction linéaire'])

  t.is(classification, 7)
  t.true(computeCommunes)
})

test('LAYERS / poste_de_transformation', t => {
  const {fields} = LAYERS.poste_de_transformation
  const {name, toponym, category, classification} = fields

  t.is(name({toponyme: 'Poste A'}), 'Poste A')
  t.is(name({toponyme: ''}), 'Poste de transformation')

  t.is(toponym({toponyme: 'Poste A'}), 'Poste A')
  t.is(toponym({toponyme: ''}), 'Poste de transformation')

  t.is(category, 'poste de transformation')
  t.is(classification, 7)
})

test('LAYERS / construction_ponctuelle', t => {
  const {filter, fields, computeCommunes} = LAYERS.construction_ponctuelle
  const {name, toponym, category, classification} = fields

  t.true(filter({nature: 'Bâtiment'}))
  t.false(filter({nature: 'Antenne'}))

  t.is(name({toponyme: 'Bâtiment A', nature: 'Bâtiment', nature_detaillee: 'Bibliothèque'}), 'Bâtiment A')
  t.is(name({toponyme: '', nature: 'Pont'}), 'Pont')
  t.is(name({toponyme: '', nature: '', nature_detaillee: ''}), 'Construction ponctuelle')

  t.is(toponym({toponyme: 'Bâtiment A', nature: 'Bâtiment', nature_detaillee: 'Bibliothèque'}), 'Bâtiment A')
  t.is(toponym({toponyme: '', nature: 'Pont'}), 'Pont')
  t.is(toponym({toponyme: '', nature: '', nature_detaillee: ''}), 'Construction ponctuelle')

  t.deepEqual(category({nature: 'Bâtiment'}), ['bâtiment', 'construction', 'construction ponctuelle'])

  t.is(classification, 7)
  t.true(computeCommunes)
})

test('LAYERS / construction_surfacique', t => {
  const {filter, fields, computeCommunes} = LAYERS.construction_surfacique
  const {name, toponym, category, classification} = fields

  t.true(filter({nature: 'Bâtiment'}))
  t.false(filter({nature: 'Escalier'}))

  t.is(name({toponyme: 'Bâtiment A', nature: 'Bâtiment', nature_detaillee: 'Bibliothèque'}), 'Bâtiment A')
  t.is(name({toponyme: '', nature: 'Pont'}), 'Pont')
  t.is(name({toponyme: '', nature: '', nature_detaillee: ''}), 'Construction surfacique')

  t.is(toponym({toponyme: 'Bâtiment A', nature: 'Bâtiment', nature_detaillee: 'Bibliothèque'}), 'Bâtiment A')
  t.is(toponym({toponyme: '', nature: 'Pont'}), 'Pont')
  t.is(toponym({toponyme: '', nature: '', nature_detaillee: ''}), 'Construction surfacique')

  t.deepEqual(category({nature: 'Bâtiment'}), ['bâtiment', 'construction', 'construction surfacique'])

  t.is(classification, 7)
  t.true(computeCommunes)
})

test('LAYERS / transport_par_cable', t => {
  const {filter, fields, computeCommunes} = LAYERS.transport_par_cable
  const {name, toponym, category, classification} = fields

  t.true(filter({nature: 'Téléphérique'}))
  t.false(filter({nature: 'Télésiège'}))

  t.is(name({toponyme: 'Téléphérique A', nature: 'Téléphérique', nature_detaillee: 'Station de montagne'}), 'Téléphérique A')
  t.is(name({toponyme: '', nature: 'Pont'}), 'Pont')
  t.is(name({toponyme: '', nature: '', nature_detaillee: ''}), 'Transport par câble')

  t.is(toponym({toponyme: 'Téléphérique A', nature: 'Téléphérique', nature_detaillee: 'Station de montagne'}), 'Téléphérique A')
  t.is(toponym({toponyme: '', nature: 'Pont'}), 'Pont')
  t.is(toponym({toponyme: '', nature: '', nature_detaillee: ''}), 'Transport par câble')

  t.deepEqual(category({nature: 'Téléphérique'}), ['téléphérique', 'transport', 'transport par câble'])

  t.is(classification, 7)
  t.true(computeCommunes)
})

test('LAYERS / aerodrome', t => {
  const {filter, fields, computeCommunes} = LAYERS.aerodrome
  const {name, toponym, category, classification} = fields

  t.true(filter({nature: 'Aéroport'}))
  t.false(filter({nature: 'Hydrobase'}))

  t.is(name({toponyme: 'Aéroport A', nature: 'Aéroport'}), 'Aéroport A')
  t.is(name({toponyme: '', nature: 'Piste d\'atterrissage'}), 'Piste d\'atterrissage')
  t.is(name({toponyme: '', nature: ''}), 'Aérodrome')

  t.is(toponym({toponyme: 'Aéroport A'}), 'Aéroport A')
  t.is(toponym({toponyme: ''}), 'Aérodrome')

  t.deepEqual(category({nature: 'Aéroport'}), ['aéroport', 'transport', 'aérodrome'])

  t.is(classification, 7)
  t.true(computeCommunes)
})

test('LAYERS / equipement_de_transport', t => {
  const {filter, fields, computeCommunes} = LAYERS.equipement_de_transport
  const {name, toponym, category, classification} = fields

  t.true(filter({nature: 'Gare'}))
  t.false(filter({nature: 'Carrefour'}))
  t.false(filter({nature: 'Tour de contrôle aérien'}))
  t.false(filter({nature: 'Autre équipement'}))
  t.false(filter({nature: 'Péage'}))

  t.is(name({toponyme: 'Gare A', nature: 'Gare', nature_detaillee: 'Gare principale'}), 'Gare A')
  t.is(name({toponyme: '', nature: 'Pont'}), 'Pont')
  t.is(name({toponyme: '', nature: '', nature_detaillee: ''}), 'Équipement de transport')

  t.is(toponym({toponyme: 'Gare A', nature_detaillee: 'Gare principale'}), 'Gare A')
  t.is(toponym({toponyme: '', nature_detaillee: 'Aire de repos'}), 'Aire de repos')
  t.is(toponym({toponyme: '', nature_detaillee: ''}), 'Équipement de transport')

  t.deepEqual(category({nature: 'Gare'}), ['gare', 'transport', 'équipement de transport'])

  t.is(classification, 7)
  t.true(computeCommunes)
})

test('LAYERS / detail_orographique', t => {
  const {filter, fields, computeCommunes} = LAYERS.detail_orographique
  const {name, toponym, category, classification} = fields

  t.true(filter({nature: 'Crête'}))
  t.false(filter({nature: 'Versant'}))

  t.is(name({toponyme: 'Crête A', nature: 'Crête'}), 'Crête A')
  t.is(name({toponyme: '', nature: 'Vallée'}), 'Vallée')
  t.is(name({toponyme: '', nature: ''}), 'Détail orographique')

  t.is(toponym({toponyme: 'Crête A'}), 'Crête A')
  t.is(toponym({toponyme: ''}), 'Détail orographique')

  t.deepEqual(category({nature: 'Crête'}), ['crête', 'élément topographique ou forestier', 'détail orographique'])

  t.is(classification({importance: '1'}), 3)
  t.is(classification({importance: '2'}), 3)
  t.is(classification({importance: '3'}), 4)
  t.is(classification({importance: '4'}), 8)

  t.true(computeCommunes)
})

test('LAYERS / zone_d_habitation', t => {
  const {filter, fields, computeCommunes} = LAYERS.zone_d_habitation
  const {name, toponym, category, classification} = fields

  t.true(filter({nature: 'Lotissement'}))
  t.true(filter({nature: 'Quartier'}))

  t.is(name({toponyme: 'Lotissement A', nature: 'Lotissement', nature_detaillee: 'Résidentiel'}), 'Lotissement A')
  t.is(name({toponyme: '', nature: 'Quartier'}), 'Quartier')
  t.is(name({toponyme: '', nature: '', nature_detaillee: ''}), 'Zone d\'habitation')

  t.is(toponym({toponyme: 'Lotissement A'}), 'Lotissement A')
  t.is(toponym({toponyme: ''}), 'Zone d\'habitation')

  t.deepEqual(category({nature: 'Lotissement'}), ['lotissement', 'zone d\'habitation'])

  t.is(classification, 7)
  t.true(computeCommunes)
})

test('LAYERS / cours_d_eau', t => {
  const {fields, computeCommunes} = LAYERS.cours_d_eau
  const {name, toponym, category, classification} = fields

  t.is(name({toponyme: 'Rivière A'}), 'Rivière A')
  t.is(name({toponyme: ''}), 'Cours d\'eau')

  t.is(toponym({toponyme: 'Rivière A'}), 'Rivière A')
  t.is(toponym({toponyme: ''}), 'Cours d\'eau')

  t.deepEqual(category, ['cours d\'eau', 'hydrographie'])

  t.is(classification, 7)
  t.true(computeCommunes)
})

test('LAYERS / detail_hydrographique', t => {
  const {filter, fields, computeCommunes} = LAYERS.detail_hydrographique
  const {name, toponym, category, classification} = fields

  t.true(filter({nature: 'Ruisseau'}))
  t.false(filter({nature: 'Amer'}))
  t.false(filter({nature: 'Cascade'}))
  t.false(filter({nature: 'Citerne'}))

  t.is(name({toponyme: 'Ruisseau A', nature: 'Ruisseau'}), 'Ruisseau A')
  t.is(name({toponyme: '', nature: 'Lac'}), 'Lac')
  t.is(name({toponyme: '', nature: ''}), 'Détail hydrographique')

  t.is(toponym({toponyme: 'Ruisseau A'}), 'Ruisseau A')
  t.is(toponym({toponyme: ''}), 'Détail hydrographique')

  t.deepEqual(category({nature: 'Ruisseau'}), ['ruisseau', 'détail hydrographique', 'hydrographie'])

  t.is(classification, 7)
  t.true(computeCommunes)
})

test('LAYERS / plan_d_eau', t => {
  const {filter, fields, computeCommunes} = LAYERS.plan_d_eau
  const {name, toponym, category, classification} = fields

  t.true(filter({nature: 'Lac'}))
  t.true(filter({nature: 'Étang'}))

  t.is(name({toponyme: 'Lac A', nature: 'Lac'}), 'Lac A')
  t.is(name({toponyme: '', nature: 'Étang'}), 'Étang')
  t.is(name({toponyme: '', nature: ''}), 'Plan d\'eau')

  t.is(toponym({toponyme: 'Lac A'}), 'Lac A')
  t.is(toponym({toponyme: ''}), 'Plan d\'eau')

  t.deepEqual(category({nature: 'Lac'}), ['lac', 'plan d\'eau', 'hydrographie'])

  t.is(classification, 7)
  t.true(computeCommunes)
})

test('LAYERS / zone_d_activite_ou_d_interet', t => {
  const {filter, fields, computeCommunes} = LAYERS.zone_d_activite_ou_d_interet
  const {name, toponym, category, classification} = fields

  t.true(filter({nature: 'Zone industrielle'}))
  t.false(filter({nature: 'Point de vue'}))
  t.false(filter({nature: 'Usine de production d\'eau potable'}))
  t.false(filter({nature: 'Abri de montagne'}))
  t.false(filter({nature: 'Aire d\'accueil des gens du voyage'}))
  t.false(filter({nature: 'Aire de détente'}))
  t.false(filter({nature: 'Aquaculture'}))
  t.false(filter({nature: 'Autre équipement sportif'}))
  t.false(filter({nature: 'Borne'}))
  t.false(filter({nature: 'Borne frontière'}))
  t.false(filter({nature: 'Carrière'}))
  t.false(filter({nature: 'Centrale électrique'}))
  t.false(filter({nature: 'Centre de documentation'}))
  t.false(filter({nature: 'Champ de tir'}))
  t.false(filter({nature: 'Départ de ski de fond'}))
  t.false(filter({nature: 'Elevage'}))
  t.false(filter({nature: 'Enceinte militaire'}))
  t.false(filter({nature: 'Espace public'}))
  t.false(filter({nature: 'Salle de danse ou de jeux'}))
  t.false(filter({nature: 'Salle de spectacle ou conférence'}))
  t.false(filter({nature: 'Science'}))
  t.false(filter({nature: 'Sports en eaux vives'}))
  t.false(filter({nature: 'Sports mécaniques'}))
  t.false(filter({nature: 'Sports nautiques'}))
  t.false(filter({nature: 'Station de pompage'}))
  t.false(filter({nature: 'Station d\'épuration'}))
  t.false(filter({nature: 'Surveillance maritime'}))
  t.false(filter({nature: 'Vestige archéologique'}))
  t.false(filter({nature: ''}))

  t.is(name({toponyme: 'Zone A', nature: 'Zone industrielle'}), 'Zone A')
  t.is(name({toponyme: '', nature: 'Parc d\'activités'}), 'Parc d\'activités')
  t.is(name({toponyme: '', nature: ''}), 'Zone d\'activité ou d\'intérêt')

  t.is(toponym({toponyme: 'Zone A'}), 'Zone A')
  t.is(toponym({toponyme: ''}), 'Zone d\'activité ou d\'intérêt')

  t.deepEqual(category({nature: 'Zone industrielle'}), ['zone industrielle', 'zone d\'activité ou d\'intérêt'])

  t.is(classification({importance: '1'}), 1)
  t.is(classification({importance: '2'}), 2)
  t.is(classification({importance: '3'}), 4)
  t.is(classification({importance: '4'}), 7)
  t.is(classification({importance: '5'}), 9)

  t.true(computeCommunes)
})

test('LAYERS / lieu_dit_non_habite', t => {
  const {filter, fields, computeCommunes} = LAYERS.lieu_dit_non_habite
  const {name, toponym, category, classification} = fields

  t.true(filter({nature: 'Bois'}))
  t.true(filter({nature: 'Colline'}))

  t.is(name({toponyme: 'Bois A', nature: 'Bois'}), 'Bois A')
  t.is(name({toponyme: '', nature: 'Colline'}), 'Colline')
  t.is(name({toponyme: '', nature: ''}), 'Lieu-dit non habité')

  t.is(toponym({toponyme: 'Bois A'}), 'Bois A')
  t.is(toponym({toponyme: ''}), 'Lieu-dit non habité')

  t.deepEqual(category({nature: 'Bois'}), ['bois', 'élément topographique ou forestier', 'lieu-dit non habité'])

  t.is(classification, 7)
  t.true(computeCommunes)
})

test('LAYERS / commune', t => {
  const {fields, simplification} = LAYERS.commune
  const {name, toponym, category, postcode, citycode, classification} = fields

  t.is(name({nom_officiel: 'Commune A'}), 'Commune A')
  t.is(toponym({nom_officiel: 'Commune A'}), 'Commune A')
  t.deepEqual(category, ['administratif', 'commune'])
  t.is(postcode({code_postal: '12345'}), '12345')
  t.deepEqual(citycode({code_insee: '75004', code_insee_du_departement: '75'}), ['75004', '75'])

  t.is(classification({
    capitale_d_etat: true,
    chef_lieu_de_region: false,
    chef_lieu_de_departement: false,
    chef_lieu_d_arrondissement: false,
    chef_lieu_de_collectivite_terr: false,
    population: 1_000_000}), 1)

  t.is(classification({
    capitale_d_etat: false,
    chef_lieu_de_region: true,
    chef_lieu_de_departement: false,
    chef_lieu_d_arrondissement: false,
    chef_lieu_de_collectivite_terr: false,
    population: 500_000}), 1)

  t.is(classification({
    capitale_d_etat: false,
    chef_lieu_de_region: false,
    chef_lieu_de_departement: true,
    chef_lieu_d_arrondissement: false,
    chef_lieu_de_collectivite_terr: false,
    population: 50_000}), 1)

  t.is(classification({
    capitale_d_etat: false,
    chef_lieu_de_region: false,
    chef_lieu_de_departement: false,
    chef_lieu_d_arrondissement: true,
    chef_lieu_de_collectivite_terr: false,
    population: 5000}), 2)

  t.is(classification({
    capitale_d_etat: false,
    chef_lieu_de_region: false,
    chef_lieu_de_departement: false,
    chef_lieu_d_arrondissement: false,
    chef_lieu_de_collectivite_terr: true,
    population: 500}), 3)

  t.is(classification({
    capitale_d_etat: false,
    chef_lieu_de_region: false,
    chef_lieu_de_departement: false,
    chef_lieu_d_arrondissement: false,
    chef_lieu_de_collectivite_terr: false,
    population: 100}), 4)

  t.is(simplification, 0.0002)
})

test('LAYERS / arrondissement_municipal', t => {
  const {fields, simplification} = LAYERS.arrondissement_municipal
  const {name, toponym, category, postcode, citycode, city, classification} = fields

  t.is(name({nom_officiel: 'Arrondissement A'}), 'Arrondissement A')
  t.is(toponym({nom_officiel: 'Arrondissement A'}), 'Arrondissement A')
  t.deepEqual(category, ['administratif', 'arrondissement municipal'])
  t.is(postcode({code_postal: '12345'}), '12345')
  t.deepEqual(citycode({code_insee: '12346', code_insee_de_la_commune_de_rattach: '12347'}), ['12346', '12347'])
  t.is(city({nom_officiel: 'City A'}), 'City A')
  t.is(classification, 2)

  t.is(simplification, 0.0002)
})

test('LAYERS / epci', t => {
  const {fields, simplification} = LAYERS.epci
  const {name, toponym, category, classification} = fields

  t.is(name({nom_officiel: 'EPCI A'}), 'EPCI A')
  t.is(toponym({nom_officiel: 'EPCI A'}), 'EPCI A')
  t.deepEqual(category, ['administratif', 'epci'])
  t.is(classification, 2)

  t.is(simplification, 0.0005)
})

test('LAYERS / departement', t => {
  const {fields, simplification} = LAYERS.departement
  const {name, toponym, category, citycode, classification} = fields

  t.is(name({nom_officiel: 'Département A'}), 'Département A')
  t.is(toponym({nom_officiel: 'Département A'}), 'Département A')
  t.deepEqual(category, ['administratif', 'département'])
  t.is(citycode({code_insee: '12345'}), '12345')
  t.is(classification, 1)

  t.is(simplification, 0.0005)
})

test('LAYERS / region', t => {
  const {fields, simplification} = LAYERS.region
  const {name, toponym, category, citycode, classification} = fields

  t.is(name({nom_officiel: 'Région A'}), 'Région A')
  t.is(toponym({nom_officiel: 'Région A'}), 'Région A')
  t.deepEqual(category, ['administratif', 'région'])
  t.deepEqual(citycode({code_insee: '12345'}), ['12345'])
  t.is(classification, 1)

  t.is(simplification, 0.0005)
})
