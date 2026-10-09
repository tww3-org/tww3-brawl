# @tww3-brawl/cors-proxy

Worker Cloudflare qui relaie les requêtes GraphQL vers twwstats (`https://broker.twwstats.com/graphql`)
et ajoute les en-têtes CORS pour `https://tww3-org.github.io` (et `http://localhost:3000`), car twwstats
n'autorise plus ces origines. Les réponses 200 sans `errors` sont mises en cache (1 h par défaut) pour
ménager twwstats ; l'en-tête `X-Proxy-Cache` indique `HIT` ou `MISS`.

Seul `POST /graphql` (ou `/`) est accepté, avec un corps de 64 Kio maximum. Les origines autorisées, l'URL
amont et la durée du cache se règlent dans `wrangler.toml` (`[vars]`).

## Développement local

```bash
pnpm --filter @tww3-brawl/cors-proxy dev
```

Le Worker écoute sur `http://localhost:8787`.

## Premier déploiement

```bash
npx wrangler login
pnpm --filter @tww3-brawl/cors-proxy deploy
```

L'URL obtenue a la forme `https://tww3-brawl-cors-proxy.<subdomain>.workers.dev`.

## Brancher le site

Dans les variables du dépôt GitHub (Settings > Secrets and variables > Actions > Variables), créer
`GRAPHQL_API_URL` avec `https://tww3-brawl-cors-proxy.<subdomain>.workers.dev/graphql`, puis relancer le
workflow `deploy-github-pages`. Tant que la variable n'est pas définie, le site appelle twwstats directement.
