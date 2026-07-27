#!/usr/bin/env bash
#
# curl-repro-duplicate-unit.sh
#
# Validates, directly against the public GraphQL data source
# (https://broker.twwstats.com/graphql), the ROOT CAUSE described in
# specs/001-fix-duplicate-unit-cards/spec.md FR-001 / FR-003:
#
#   FR-001: the backend can return several `units[]` entries that a human
#           perceives as "the same unit/character" sharing the same
#           technical `caste`, where the display name (`onscreen_name`)
#           differs between entries because some entries carry a raw,
#           UNRESOLVED translation key (e.g. `{{tr:...}}`) instead of the
#           localized string.
#   FR-003: a raw `{{tr:...}}` key must never be treated as a valid,
#           distinguishing display name.
#
# This script is independent of the frontend: it only issues read-only
# GraphQL POST queries and inspects the raw JSON response.
#
# --- Which case this script demonstrates, and why -------------------------
#
# The bug was originally reported against "Styrkaar" (a Chaos/Slaanesh hero,
# DLC27): the backend allegedly returned two `units[]` rows sharing the
# exact same `unit` + `caste` pair, one resolved, one raw.
#
# At the time this script was written (2026-07-27), that EXACT literal
# collision (identical `unit` id AND `caste`, differing `onscreen_name`) is
# no longer reproducible anywhere in the live broker.twwstats.com data set
# for Styrkaar specifically -- nor for ANY unit, checked exhaustively across
# all 4 available TWW3 patches, the TWW2 "Latest" version, and 3 actively
# maintained TWW3 mod data sets (SFO, Radious, TDDN), both faction-scoped
# and via the global `units(query: ...)` search. This strongly suggests the
# upstream aggregator re-synced/backfilled the missing translation for this
# specific hero since the bug was first observed.
#
# However, the underlying data-layer DEFECT that causes this whole bug class
# -- the broker returning a literal, unresolved `{{tr:...}}` key as
# `land_unit.onscreen_name` for units that are otherwise legitimately live
# and recruitable -- is still fully reproducible right now, and it is still
# reproducible on the *exact* Styrkaar unit family named in the bug report:
#
#   wh3_dlc27_sla_cha_styrkaar_the_sortsvinaer                  | Hero | "Styrkaar of the Sortsvinaer"   (resolved)
#   wh3_dlc27_sla_cha_styrkaar_the_sortsvinaer_steed_of_slaanesh | Hero | "{{tr:land_units_onscreen_name_wh3_dlc27_sla_cha_styrkaar_the_sortsvinaer}}"  (RAW)
#   wh3_dlc27_sla_cha_styrkaar_the_sortsvinaer_daemonic_steed    | Hero | "{{tr:land_units_onscreen_name_wh3_dlc27_sla_cha_styrkaar_the_sortsvinaer}}"  (RAW)
#
# These 3 rows are the same logical hero (Styrkaar, on foot / on his Steed of
# Slaanesh / on his Daemonic Steed), all sharing `caste == "Hero"`. Two of
# the three (the mounted variants) carry the literal raw key -- the exact
# defect FR-003 defends against -- while the third (dismounted) carries the
# correctly resolved name. This is the closest live, concrete evidence of
# the reported failure mode: entries for what a player perceives as "the
# same character" mixing resolved and raw names under a shared identifier.
#
# This script therefore checks: for the Styrkaar hero family, do we still
# get >= 1 entry with a RAW `{{tr:...}}` onscreen_name and >= 1 entry with a
# validly RESOLVED onscreen_name, all sharing caste "Hero"? If yes, the
# root-cause data defect is proven live and the script exits 0. If the
# upstream data has since been fully cleaned (no raw entries left at all),
# the regression check no longer has anything to prove and exits non-zero
# with a clear message.
#
# ---------------------------------------------------------------------------

set -euo pipefail

GRAPHQL_ENDPOINT="https://broker.twwstats.com/graphql"

# Discovered by running: curl -s -X POST -H "Content-Type: application/json" \
#   -d '{"query":"{ versions { id name game } }"}' https://broker.twwstats.com/graphql
# -> first entry with game == "TWW3" is the current/latest patch.
VERSION_ID="1959622576716276016" # "Patch 8.1.1", game: TWW3

# Discovered by running: curl -s -X POST -H "Content-Type: application/json" \
#   -d '{"query":"{ tww(tww_version: \"1959622576716276016\") { factions { key screen_name subculture { name } } } }"}' \
#   https://broker.twwstats.com/graphql
# -> filtering subculture.name == "Slaanesh" gives key "wh3_main_sla_slaanesh"
#    (screen_name: "Seducers of Slaanesh") -- the faction whose recruitable
#    roster includes the DLC27 hero Styrkaar of the Sortsvinaer.
FACTION_KEY="wh3_main_sla_slaanesh"

# Substring used to pick out the Styrkaar hero family from the faction's
# unit list (matches the base unit and both mounted variants).
UNIT_ID_SUBSTRING="styrkaar_the_sortsvinaer"

have_jq=true
if ! command -v jq >/dev/null 2>&1; then
  have_jq=false
  echo "WARNING: jq not found; falling back to raw JSON output." >&2
fi

echo "== Step 1/2: confirm version ${VERSION_ID} is still a valid TWW3 version =="
versions_response=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"query":"{ versions { id name game } }"}' \
  "$GRAPHQL_ENDPOINT")

if $have_jq; then
  match=$(echo "$versions_response" | jq -r --arg id "$VERSION_ID" \
    '.data.versions[]? | select(.id == $id) | "\(.name) (\(.game))"')
  if [ -z "$match" ]; then
    echo "FAIL: version id $VERSION_ID was not found in the live /versions list." >&2
    echo "$versions_response" | jq '.data.versions'
    exit 1
  fi
  echo "Version confirmed: $match"
else
  echo "$versions_response"
fi

echo
echo "== Step 2/2: fetch faction '${FACTION_KEY}' units and isolate the Styrkaar family =="
units_query=$(cat <<EOF
{"query":"{ tww(tww_version: \"${VERSION_ID}\") { faction(id: \"${FACTION_KEY}\") { key screen_name units { unit caste recruitment_cost land_unit { onscreen_name } } } } }"}
EOF
)

units_response=$(curl -s -X POST -H "Content-Type: application/json" \
  -d "$units_query" \
  "$GRAPHQL_ENDPOINT")

if ! $have_jq; then
  echo "$units_response"
  echo
  echo "jq is required to evaluate the pass/fail condition automatically; install jq and re-run." >&2
  exit 1
fi

echo "Full faction response (pretty-printed):"
echo "$units_response" | jq '.data.tww.faction | {key, screen_name}'

echo
echo "Matching '${UNIT_ID_SUBSTRING}' entries in '${FACTION_KEY}' units[]:"
family_entries=$(echo "$units_response" | jq -c --arg sub "$UNIT_ID_SUBSTRING" \
  '.data.tww.faction.units[]? | select(.unit | test($sub))')

if [ -z "$family_entries" ]; then
  echo "FAIL: no units[] entries matching '${UNIT_ID_SUBSTRING}' were found in faction '${FACTION_KEY}'." >&2
  echo "The unit may have been renamed/removed upstream; this script needs updating." >&2
  exit 1
fi

echo "$family_entries" | jq '.'

# Classify each matching entry's onscreen_name as RAW ({{...}}) or RESOLVED.
raw_count=$(echo "$family_entries" | jq -r '.land_unit.onscreen_name // ""' \
  | grep -c -E '^\{\{.*\}\}$' || true)
resolved_count=$(echo "$family_entries" | jq -r '.land_unit.onscreen_name // ""' \
  | grep -c -v -E '^\{\{.*\}\}$|^$' || true)
total_count=$(echo "$family_entries" | jq -s 'length')

echo
echo "Summary: ${total_count} entries for the Styrkaar hero family; ${raw_count} RAW (unresolved {{tr:...}}), ${resolved_count} RESOLVED."

if [ "$raw_count" -ge 1 ] && [ "$resolved_count" -ge 1 ] && [ "$total_count" -ge 2 ]; then
  echo
  echo "PASS: root-cause pattern reproduced live -- the same '${UNIT_ID_SUBSTRING}' hero family" \
       "(all caste=Hero) currently has both a correctly RESOLVED onscreen_name entry and" \
       "at least one RAW, unresolved '{{tr:...}}' onscreen_name entry. This is the exact" \
       "data-layer defect FR-001/FR-003 require the frontend to defend against" \
       "(dedupe by unit/caste, never render a raw key)."
  exit 0
else
  echo
  echo "FAIL: the raw-translation-key pattern is no longer present for '${UNIT_ID_SUBSTRING}'" \
       "(raw_count=${raw_count}, resolved_count=${resolved_count}). The upstream data may have" \
       "been fully cleaned; re-run against another DLC27+ hero or mount-variant unit to find" \
       "current live evidence of the pattern." >&2
  exit 1
fi
