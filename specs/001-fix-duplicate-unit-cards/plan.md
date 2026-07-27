# Implementation Plan: Correction des cartes d'unités dédoublées avec nom brut non résolu

**Branch**: `001-fix-duplicate-unit-cards` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fix-duplicate-unit-cards/spec.md`

## Summary

Le backend GraphQL externe (`broker.twwstats.com`) renvoie, pour certaines unités (ex. Styrkaar, DLC27), deux entrées `units[]` distinctes pour la même unité logique : l'une avec un `land_unit.onscreen_name` correctement traduit, l'autre avec la clé de traduction brute non résolue (`{{tr:...}}`). Le regroupement/dédoublonnage actuel, dans `apps/responsive-app/components/UnitCard/SelectUnit.vue` (`groupedUnits` computed), fusionne par **texte affiché** (`onscreen_name`) au lieu d'une clé technique stable. Comme les deux entrées ont des noms différents, elles hashent vers deux groupes différents et survivent toutes les deux à la fusion → carte dupliquée, dont une affiche le texte brut de la clé de traduction.

Approche technique : déplacer la logique de regroupement/dédoublonnage et de résolution du nom d'affichage vers `packages/sdk` (couche domaine, agnostique du framework, testable — Principe I de la constitution), en dédoublonnant par clé technique stable (`unit` + `caste`) et en ajoutant une détection du motif `{{tr:...}}` pour fournir un nom de repli lisible. Le composant Vue `SelectUnit.vue` (et `UnitCard/index.vue`) consomme ensuite ces helpers sdk plutôt que de réimplémenter la logique en local.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js >= 20.18.1
**Primary Dependencies**: Nuxt 3, Vue 3, Quasar, Pinia, TanStack Vue Query (app) ; `@tww3-brawl/gql` (genql client) consommé par `@tww3-brawl/sdk`
**Storage**: N/A — aucune persistance ; données lues en direct depuis l'API GraphQL publique `https://broker.twwstats.com/graphql`
**Testing**: `packages/sdk/package.json` référence un script `"test": "jest"`, mais **Jest n'est en réalité pas installé** dans le repo (absent de `node_modules/.bin` à la racine comme dans `packages/sdk`, absent de `pnpm-lock.yaml`) — le "Jest configuré" mentionné par la constitution est donc aspirationnel, pas fonctionnel. Installer et configurer Jest pour ce seul correctif serait une adoption d'outillage plus lourde que nécessaire (contraire au Principe V pour un bug fix ciblé). Validation retenue à la place : compilation TypeScript stricte (`tsc`) comme garde-fou statique, validation manuelle du frontend via Playwright MCP, et validation du comportement des données via `curl` sur l'endpoint GraphQL public
**Target Platform**: Site statique généré (`nuxt generate`) déployé sur GitHub Pages ; navigateurs web modernes
**Project Type**: Monorepo pnpm — application web (frontend Nuxt) + packages partagés (`sdk`, `gql`)
**Performance Goals**: Aucune contrainte de performance spécifique introduite ; le dédoublonnage reste en O(n) sur le nombre d'unités d'une faction (quelques dizaines à centaines d'entrées max)
**Constraints**: Aucune modification du schéma GraphQL généré (`packages/gql`, Principe III — code généré en lecture seule) ; aucune dépendance serveur/backend supplémentaire (Principe IV — déployabilité statique) ; le repo n'a **aucun outillage ESLint/Prettier installé** malgré un script `"lint": "eslint src"` dans `packages/sdk/package.json` (pas de config, pas de binaire eslint dans `node_modules/.bin`) — la vérification de style se limite donc à la compilation TypeScript stricte (`tsc`) et à `nuxt build`/`nuxt generate` pour l'app
**Scale/Scope**: Correction ciblée sur 1 composant Vue (`SelectUnit.vue`), 1 point d'affichage additionnel (`UnitCard/index.vue`), et 1-2 nouveaux fichiers helpers dans `packages/sdk/src`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principe I (Layered Monorepo Boundaries)** : ✅ Respecté — la logique de dédoublonnage/résolution de nom est un traitement de données de faction/unité, donc elle est placée dans `packages/sdk` (framework-agnostique), pas dans le composant Vue. `responsive-app` continue de consommer `sdk` via son point d'entrée public (`@tww3-brawl/sdk/src/...` déjà utilisé ailleurs dans le repo, ex. `UnitCard/index.vue:24`).
- **Principe II (Reverse-Engineered Game Fidelity)** : N/A directement (pas de formule de jeu modifiée), mais le nouveau helper de détection de clé brute documentera en commentaire le motif observé (`{{tr:...}}`) et son origine (échec de traduction côté service tiers), conformément à l'esprit du principe (documenter les comportements non officiels/observés).
- **Principe III (Generated Code Is Read-Only)** : ✅ Respecté — aucun fichier sous `packages/gql/src` n'est modifié ; les champs déjà sélectionnés (`unit`, `caste`, `land_unit.onscreen_name`, `recruitment_cost`) suffisent.
- **Principe IV (Static-Site Deployability)** : ✅ Respecté — correction 100% côté build statique, aucune route serveur ni dépendance backend ajoutée.
- **Principe V (Type Safety & Deliberate Simplicity)** : ✅ Respecté — TypeScript strict conservé ; pas d'abstraction spéculative (pas de système de traduction générique introduit, seulement une détection de motif + un nom de repli). Écart documenté et assumé : Jest n'étant pas réellement installé, aucun test unitaire n'est ajouté pour ce correctif ciblé plutôt que d'introduire l'outillage de test complet pour une seule fonction ; le gap est noté ici conformément à la clause "si différé, noter l'écart" du Principe V. La validation repose sur `tsc` + Playwright + `curl` (voir Testing ci-dessus).

Aucune violation à justifier — pas d'entrée dans Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-duplicate-unit-cards/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (/speckit.specify command output)
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

No `research.md`, `data-model.md`, `contracts/`, or `quickstart.md` are generated for this feature: there are no unresolved `NEEDS CLARIFICATION` items requiring research, no new persisted entities, and no new external-facing interface contract (the fix consumes the existing GraphQL selection unchanged and exposes only internal sdk helper functions, not a public contract).

### Source Code (repository root)

```text
packages/
├── gql/                          # generated GraphQL client — UNCHANGED (read-only per constitution)
└── sdk/
    └── src/
        ├── data/
        │   └── factionUnits.ts   # existing fetchFactionUnits(); ADD: dedupe/group helper(s) here
        ├── utils/
        │   ├── getUnitDisplayName.ts   # NEW: resolve display name, detect raw {{tr:...}} pattern, humanized fallback
        │   └── index.ts                # export the new helper
        └── types.ts               # Unit type — no structural change expected

apps/responsive-app/
└── components/
    └── UnitCard/
        ├── SelectUnit.vue         # groupedUnits computed: dedupe by stable key via sdk helper, not by onscreen_name string
        └── index.vue              # unitTitle computed: use sdk helper instead of raw onscreen_name
```

**Structure Decision**: Web application monorepo (pnpm workspaces). New logic lives in `packages/sdk` (domain layer) per Principe I, consumed by the Nuxt component layer in `apps/responsive-app`. No new top-level directories; existing layered structure (`gql` → `sdk` → `responsive-app`) is preserved.

## Complexity Tracking

> Not applicable — no Constitution Check violations.
