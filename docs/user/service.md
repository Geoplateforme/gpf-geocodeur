# Démarrage du service

Avant de lancer le service, veuillez vérifier que :

- Le service a été correctement [installé](./user/installation.md) et [configuré](./user/configuration.md)
- Vous disposez des [données pré-indexées](./user/indexation.md) dans votre dossier `data`.

Sur 4 terminaux différents, lancez successivement les 3 services d'index thématiques et le service exposant l'API publique :

```bash
yarn address:start
```

```bash
yarn parcel:start
```

```bash
yarn poi:start
```

```bash
yarn api:start
```
