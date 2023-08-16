# Géocodeur de la Géoplateforme

## Démarrage rapide (Docker)

```bash
docker compose -f docker-compose-quickstart.yml up
```

Le géocodeur sera lancé sur les données du département de la Moselle en quelques minutes, et sera accessible à l'adresse http://localhost:3000.

## Documentation

- [Architecture du service](docs/architecture.md)
- [Procédure d'installation](docs/installation.md)
- [Configuration](docs/configuration.md)
- [Génération des POI](docs/poi.md)
- [Production des index thématiques](docs/indexation.md)
- [Démarrage du service](docs/service.md)
- [Développement](docs/dev.md)

## OpenAPI

L'API du géocodeur expose ses propres descriptions [OpenAPI](https://www.openapis.org) (anciennemment Swagger).

En attendant la mise en production du service vous pouvez utiliser celles de l'environnement de test :
- [Géocodage](https://gpf-geocodeur.livingdata.co/geocodage/openapi/geocode.yaml)
- [Auto-complétion](https://gpf-geocodeur.livingdata.co/completion/openapi/completion.yaml)

## Licence

MIT
