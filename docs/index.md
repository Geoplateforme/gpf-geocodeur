# Géocodeur de la géoplateforme

## Démarrage rapide (Docker)

```bash
docker compose -f docker-compose-quickstart.yml up
```

Le géocodeur sera lancé sur les données du département de la Moselle en quelques minutes, et sera accessible à l'adresse <http://localhost:3000>.

## Documentation

- [Architecture du service](architecture.md)
- [Procédure d'installation](user/installation.md)
- [Configuration](user/configuration.md)
- [Génération des POI](user/poi.md)
- [Production des index thématiques](user/indexation.md)
- [Démarrage du service](user/service.md)
- [Développement](user/dev.md)

## OpenAPI

L'API du géocodeur expose ses propres descriptions [OpenAPI](https://www.openapis.org) (anciennemment Swagger).

En attendant la mise en production du service vous pouvez utiliser celles de l'environnement de test :

- [Géocodage](https://gpf-geocodeur.livingdata.co/openapi.yaml)
- [Auto-complétion](https://gpf-geocodeur.livingdata.co/completion/openapi.yaml)

## Licence

MIT
