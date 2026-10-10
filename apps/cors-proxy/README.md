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

## Déploiement (GitHub Actions, depuis un téléphone)

Wrangler ne tourne pas sur Android/Termux : le déploiement passe donc par le workflow GitHub Actions.

1. Dashboard Cloudflare > *Workers & Pages* : l'ouvrir une fois pour choisir le sous-domaine
   `*.workers.dev` (obligatoire avant le premier déploiement), et copier l'**Account ID**.
2. Cloudflare > *My Profile > API Tokens > Create Token*, modèle **« Edit Cloudflare Workers »**.
3. Dépôt GitHub > *Settings > Secrets and variables > Actions* : créer les secrets
   `CLOUDFLARE_API_TOKEN` et `CLOUDFLARE_ACCOUNT_ID`.
4. GitHub > *Actions* > « Deploy CORS proxy (Cloudflare Worker) » > *Run workflow*. Copier l'URL affichée
   dans le résumé du run (forme `https://tww3-brawl-cors-proxy.<subdomain>.workers.dev`).
5. Créer la variable `GRAPHQL_API_URL` = cette URL + `/graphql`, puis relancer « Deploy to GitHub Pages ».

Le workflow se relance aussi à chaque push sur `main` touchant `apps/cors-proxy/`.

## Déploiement local (alternative)

```bash
npx wrangler login
pnpm --filter @tww3-brawl/cors-proxy deploy
```

## Brancher le site

Dans les variables du dépôt GitHub (Settings > Secrets and variables > Actions > Variables), créer
`GRAPHQL_API_URL` avec `https://tww3-brawl-cors-proxy.<subdomain>.workers.dev/graphql`, puis relancer le
workflow « Deploy to GitHub Pages ». Tant que la variable n'est pas définie, le site appelle twwstats directement.
