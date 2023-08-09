# geocodeur

## Documentation (en français)

- [Architecture du service](docs/architecture.md)
- [Procédure d'installation](docs/installation.md)
- [Configuration](docs/configuration.md)
- [Génération des POI](docs/poi.md)
- [Production des index thématiques](docs/indexation.md)
- [Démarrage du service](docs/service.md)

## Build datas / indexes

```bash
yarn poi:build-from-bdtopo
yarn poi:build-index
yarn parcel:build-index
yarn address:build-index
```

## Start server / services
> In 4 differents shells

```bash
yarn api:start
yarn poi:start
yarn parcel:start
yarn address:start
```
