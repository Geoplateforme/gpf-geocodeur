# Géocodeur de la Géoplateforme

## Démarrage rapide (Docker)

```bash
docker compose -f docker-compose-quickstart.yml up
```

Le géocodeur sera lancé sur les données du département de la Moselle en quelques minutes, et sera accessible à l'adresse <http://localhost:3000>.

## Documentation

- [Architecture du service](docs/architecture.md)
- [Procédure d'installation](docs/user/installation.md)
- [Configuration](docs/user/configuration.md)
- [Génération des POI](docs/user/poi.md)
- [Production des index thématiques](docs/user/indexation.md)
- [Démarrage du service](docs/user/service.md)
- [Développement](docs/user/dev.md)

## OpenAPI

L'API du géocodeur expose ses propres descriptions [OpenAPI](https://www.openapis.org) (anciennemment Swagger).

En attendant la mise en production du service vous pouvez utiliser celles de l'environnement de test :

- [Géocodage](https://gpf-geocodeur.livingdata.co/geocodage/openapi/geocode.yaml)
- [Auto-complétion](https://gpf-geocodeur.livingdata.co/completion/openapi/completion.yaml)

## Licence

MIT
