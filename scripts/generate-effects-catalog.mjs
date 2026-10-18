#!/usr/bin/env node
/**
 * Génère le catalogue d'effets de mêlée (packages/sdk/src/data/effects/catalog.generated.ts)
 * à partir de l'API GraphQL twwstats.
 *
 * Usage : node scripts/generate-effects-catalog.mjs [versionId]
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENDPOINT = 'https://broker.twwstats.com/graphql';
const OUT_FILE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../packages/sdk/src/data/effects/catalog.generated.ts'
);
const ICON_DIR = 'ui/battle ui/ability_icons';

// stat du jeu -> chemin dans BrawlModifiers
const STAT_MAP = {
  stat_melee_attack: ['attack'],
  stat_melee_defence: ['defense'],
  stat_armour: ['armor'],
  stat_melee_damage_base: ['damage', 'normal'],
  stat_melee_damage_ap: ['damage', 'piercing'],
  stat_bonus_vs_large: ['damage', 'bonus_v_large'],
  stat_bonus_vs_infantry: ['damage', 'bonus_v_infantry'],
  stat_resistance_physical: ['resistance', 'physical'],
  stat_resistance_magic: ['resistance', 'magic'],
  stat_resistance_flame: ['resistance', 'fire'],
  stat_weakness_flame: ['resistance', 'fire'],
  stat_resistance_all: ['resistance', 'ward_save'],
};

// Attributs retenus manuellement
const ATTRIBUTES = {
  ignore_imbue_contact_effects_enemy: ['enemy_contact_effects'],
  unyielding_assault: ['attack_reduction'],
  slayer: ['weapon_strength_reduction'],
};

// Corrections manuelles, fusionnées en profondeur en dernier
const OVERRIDES = {
  wh2_pro08_unit_contact_dampen: { modifiers: { damage: { is_magical: false } } },
  // « Wounds » (−20 % dégâts) : passif natif de toute entité unique, mais désactivé par défaut
  wh3_main_unit_passive_single_entity: { default_active: false },
};

const PHASE_FIELDS = `id onscreen_name duration effect_type imbue_magical imbue_ignition damage_amount
  stat_effects{stat value how} attribute_effects{attribute attribute_type}`;

async function gql(query) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

function strip(text) {
  return String(text ?? '')
    .replace(/\[\[img:[^\]]*\]\]\s*\[\[\/img\]\]/g, '')
    .replace(/\[\[img:[^\]]*\]\]/g, '')
    .replace(/\[\[\/?[a-z_]+(?::[^\]]*)?\]\]/gi, '')
    .replace(/\{\{tr:[^}]*\}\}/g, '')
    .replace(/\\+n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const round = (n) => Math.round(n * 10000) / 10000;

function isObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (isObject(v)) {
      target[k] = deepMerge(isObject(target[k]) ? target[k] : {}, v);
    } else {
      target[k] = v;
    }
  }
  return target;
}

function addStat(mods, path, stat) {
  let node = mods;
  for (const key of path.slice(0, -1)) node = node[key] ??= {};
  const leaf = path[path.length - 1];
  const cur = (node[leaf] ??= {});
  if (stat.how === 'mult') cur.mult = round((cur.mult ?? 1) * stat.value);
  else if (stat.how === 'add') cur.add = round((cur.add ?? 0) + stat.value);
}

/** Modificateurs d'une phase (sans la fusion avec les autres phases) */
function phaseModifiers(phase) {
  const mods = {};
  for (const stat of phase.stat_effects ?? []) {
    const path = STAT_MAP[stat.stat];
    if (path && typeof stat.value === 'number') addStat(mods, path, stat);
  }
  if (phase.imbue_magical) (mods.damage ??= {}).is_magical = true;
  if (phase.imbue_ignition > 0) (mods.damage ??= {}).is_fire = true;
  if (phase.imbue_contact?.id) mods.contact_effect = phase.imbue_contact.id;
  return mods;
}

const isEmpty = (mods) => Object.keys(mods).length === 0;

function sortKeys(obj) {
  return Object.fromEntries(Object.keys(obj).sort().map((k) => [k, obj[k]]));
}

function contactEntry(phase) {
  const [rawName, ...extras] = String(phase.onscreen_name ?? '').split(/\\+n|\n/);
  const name = strip(rawName).replace(/!+$/, '').trim();
  const extra = strip(extras.join(' '));
  const seconds = phase.duration > 0 ? `${round(phase.duration)}s` : '';
  const description = [extra, seconds && `Duration: ${seconds}`].filter(Boolean).join(' · ');
  const mods = phaseModifiers(phase);
  delete mods.contact_effect;
  const entry = {
    id: phase.id,
    kind: 'contact',
    name: name || humanizeKey(phase.id),
    ...(description && { description }),
    icon: `${ICON_DIR}/${phase.id}.png`,
    placement: 'attack',
    target: 'enemy',
    passive: true,
    polarity: phase.effect_type === 'positive' ? 'positive' : 'negative',
    modifiers: mods,
  };
  return entry;
}

const ROLES = new Set(['self', 'enemy', 'enemies', 'allies', 'ally', 'debuff']);
const ROLE_ALIASES = { ally: 'allies' };
const STAGE_RE = /_(upgraded|i|ii|iii|iv|v|vi|\d+)$/;
const ROMAN = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6 };

/**
 * Décompose l'id d'une phase : rôle final éventuel (self, enemy, ...), puis étage final éventuel
 * (chiffre romain ou nombre ; absent = étage 0). `base` est l'id sans rôle ni étage.
 */
function parsePhaseId(id) {
  let rest = String(id);
  let role = '';
  let stage = 0;
  // étage / qualificatif final (`_ii`, `_2`, `_upgraded`), éventuellement avant et après le rôle
  const stripStage = () => {
    for (let m = rest.match(STAGE_RE); m; m = rest.match(STAGE_RE)) {
      stage = Math.max(stage, m[1] === 'upgraded' ? 1 : (ROMAN[m[1]] ?? Number(m[1])));
      rest = rest.slice(0, -m[0].length);
    }
  };
  stripStage();
  const roleMatch = rest.match(/_([a-z]+)$/);
  if (roleMatch && ROLES.has(roleMatch[1])) {
    role = ROLE_ALIASES[roleMatch[1]] ?? roleMatch[1];
    rest = rest.slice(0, -roleMatch[0].length);
    stripStage();
  }
  return { role, stage, base: rest };
}

const CATEGORY_RE =
  /^(?:(?:unit|character|lord|hero|item|weapon|quest|army|banner|ancillary|mount|magic_item|lore)_(?:passives?|abilities|ability|active|actives)_|spell_|recipe_)/;
const ROMAN_WORDS = new Set(['ii', 'iii', 'iv', 'vi']);

/** Nom lisible dérivé d'une clé : sans préfixe jeu/DLC ni catégorie, en Title Case */
function humanizeKey(key) {
  let s = String(key).replace(/^wh\d?_[a-z]+\d*_/, '');
  for (let prev = ''; prev !== s; ) {
    prev = s;
    s = s.replace(CATEGORY_RE, '');
  }
  const words = s.split('_').filter(Boolean);
  return words
    .map((w, i) =>
      ROMAN_WORDS.has(w) || (w === 'i' && i === words.length - 1 && words.length > 1)
        ? w.toUpperCase()
        : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(' ') || key;
}

/** Plus long préfixe commun (en tokens `_`) d'une liste d'ids */
function commonTokenPrefix(ids) {
  const split = ids.map((id) => id.split('_'));
  const out = [];
  for (let i = 0; i < split[0].length; i++) {
    if (split.every((t) => t[i] === split[0][i])) out.push(split[0][i]);
    else break;
  }
  return out;
}

const capitalize = (w) => w.charAt(0).toUpperCase() + w.slice(1);

/**
 * Entrées du catalogue pour une capacité. Les phases sont groupées par id sans étage : on ne garde
 * que l'étage le plus élevé (état final). Les groupes à rôle (ennemi, alliés, après-effet) et les
 * variantes aléatoires donnent des entrées supplémentaires `variant_of`.
 */
function abilityEntries(ability) {
  const phases = ability.phases ?? [];
  const groups = new Map();
  for (const phase of phases) {
    const { role, stage, base } = parsePhaseId(phase.id);
    const gk = `${role}|${base}`;
    const cur = groups.get(gk);
    if (!cur || stage > cur.stage) groups.set(gk, { role, base, stage, phase });
  }
  const list = [...groups.values()];
  const sa = ability.unit_special_ability ?? {};
  const baseTarget = sa.target_enemies && !sa.affect_self ? 'enemy' : 'self';
  const rawName = strip(ability.name);
  // nom vide ou générique (ex. « Upgraded ») : repli sur la clé humanisée
  const baseName = rawName && !/^upgraded$/i.test(rawName) ? rawName : humanizeKey(ability.key);
  const tooltip = strip(ability.tooltip);
  const description = tooltip && (tooltip.length > 300 ? `${tooltip.slice(0, 297)}...` : tooltip);

  const make = ({ id, name, phase, target, polarity, passive, variantOf }) => {
    const mods = phaseModifiers(phase);
    if (isEmpty(mods)) return null;
    const onlyWeapon = Object.keys(mods).every((k) => k === 'contact_effect' || k === 'damage') &&
      Object.keys(mods.damage ?? {}).every((k) => k === 'is_magical' || k === 'is_fire');
    return {
      id,
      kind: 'ability',
      name,
      ...(description && { description }),
      icon: `${ICON_DIR}/${ability.icon_name}.png`,
      placement: onlyWeapon ? 'attack' : 'effects',
      target,
      passive,
      polarity: polarity ?? (target === 'enemy' || phase.effect_type === 'negative' ? 'negative' : 'positive'),
      modifiers: mods,
      ...(variantOf && { variant_of: variantOf }),
    };
  };

  const key = ability.key;
  const passive = Boolean(sa.passive);
  const result = [];
  // En jeu, sans phase `_self` et avec `affect_self`, la phase « alliés » couvre aussi le lanceur
  // (aura autour de lui) : elle devient l'entrée principale au lieu de `${key}__allies`.
  const alliesCoverSelf = Boolean(sa.affect_self) &&
    list.some((g) => g.role === 'allies') && !list.some((g) => g.role === 'self');
  const main = list.filter((g) => g.role === '' || g.role === 'self' || (alliesCoverSelf && g.role === 'allies'));
  const prefix = main.length > 1 ? commonTokenPrefix(main.map((g) => g.base)) : [];
  for (const g of main) {
    const variant = main.length > 1 ? g.base.split('_').slice(prefix.length).join('_') : '';
    if (!variant) {
      result.push(make({ id: key, name: baseName, phase: g.phase, target: baseTarget, passive }));
    } else {
      result.push(make({
        id: `${key}__${variant}`,
        name: `${baseName} (${variant.split('_').map(capitalize).join(' ')})`,
        phase: g.phase,
        target: baseTarget,
        passive,
        variantOf: key,
      }));
    }
  }
  for (const g of list) {
    if (g.role === 'enemy' || g.role === 'enemies') {
      result.push(make({ id: `${key}__enemy`, name: `${baseName} (enemy)`, phase: g.phase, target: 'enemy', polarity: 'negative', passive, variantOf: key }));
    } else if (g.role === 'allies' && !alliesCoverSelf) {
      result.push(make({ id: `${key}__allies`, name: `${baseName} (allies)`, phase: g.phase, target: 'self', passive, variantOf: key }));
    } else if (g.role === 'debuff') {
      result.push(make({ id: `${key}__debuff`, name: `${baseName} (after effect)`, phase: g.phase, target: 'self', polarity: 'negative', passive: false, variantOf: key }));
    }
  }
  return result.filter(Boolean);
}

function attributeEntry(attr, immunities) {
  const [title, ...rest] = String(attr.bullet_text ?? '').split('||');
  return {
    id: attr.key,
    kind: 'attribute',
    name: strip(title) || humanizeKey(attr.key),
    ...(rest.length && strip(rest.join(' ')) && { description: strip(rest.join(' ')) }),
    icon: `${ICON_DIR}/${attr.key}.png`,
    placement: 'effects',
    target: 'self',
    passive: true,
    polarity: 'positive',
    modifiers: { immunities },
  };
}

async function main() {
  let versionId = process.argv[2];
  const { versions } = await gql('{ versions { id name game } }');
  const version = versionId
    ? versions.find((v) => v.id === versionId)
    : versions.find((v) => v.game === 'TWW3');
  if (!version) throw new Error('Version introuvable');
  versionId = version.id;
  const versionName = version.name;
  console.log(`Version: ${versionName} (${versionId})`);

  const [abilitiesData, unitsData, attributesData] = await Promise.all([
    gql(`{ tww(tww_version:"${versionId}"){ abilities(offset:0,size:10000){
      key name icon_name is_hidden_in_ui tooltip type{key}
      unit_special_ability{ passive affect_self target_enemies target_friends }
      phases{ ${PHASE_FIELDS} imbue_contact{ ${PHASE_FIELDS} } } } } }`),
    gql(`{ tww(tww_version:"${versionId}"){ units(offset:0,size:5000,includeSummoned:true){
      unit land_unit{ primary_melee_weapon{ contact_phase{ ${PHASE_FIELDS} } } } } } }`),
    gql(`{ tww(tww_version:"${versionId}"){ attributes{ key bullet_text } } }`),
  ]);
  const abilities = abilitiesData.tww.abilities ?? [];
  const units = unitsData.tww.units ?? [];
  const attributes = attributesData.tww.attributes ?? [];

  const entries = {};

  // Effets de contact : armes + phases imbue_contact des capacités
  const contactPhases = new Map();
  for (const u of units) {
    const phase = u.land_unit?.primary_melee_weapon?.contact_phase;
    if (phase?.id) contactPhases.set(phase.id, phase);
  }
  for (const ability of abilities) {
    for (const phase of ability.phases ?? []) {
      if (phase.imbue_contact?.id) contactPhases.set(phase.imbue_contact.id, phase.imbue_contact);
    }
  }
  for (const phase of contactPhases.values()) entries[phase.id] = contactEntry(phase);

  // Capacités
  let excluded = 0;
  for (const ability of abilities) {
    if (ability.is_hidden_in_ui || entries[ability.key]) {
      excluded++;
      continue;
    }
    const list = abilityEntries(ability);
    for (const entry of list) entries[entry.id] = entry;
    if (!list.length) excluded++;
  }

  // Attributs
  for (const attr of attributes) {
    if (ATTRIBUTES[attr.key]) entries[attr.key] = attributeEntry(attr, ATTRIBUTES[attr.key]);
  }

  for (const [id, override] of Object.entries(OVERRIDES)) {
    if (entries[id]) deepMerge(entries[id], override);
    else console.warn(`Override ignoré (entrée absente): ${id}`);
  }

  const sorted = sortKeys(entries);
  const lines = Object.entries(sorted).map(([id, e]) => `  ${JSON.stringify(id)}: ${JSON.stringify(e)},`);
  const content = `// Fichier généré par scripts/generate-effects-catalog.mjs : ne pas modifier à la main.
// Version : ${versionName} (${versionId}) - généré le ${new Date().toISOString().slice(0, 10)}
import type { EffectDefinition } from '../../types';

export const EFFECTS_CATALOG_VERSION = ${JSON.stringify({ id: versionId, name: versionName })};

export const GENERATED_EFFECTS: Record<string, EffectDefinition> = {
${lines.join('\n')}
};
`;
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, content);

  const count = (key) => {
    const c = {};
    for (const e of Object.values(sorted)) c[e[key]] = (c[e[key]] ?? 0) + 1;
    return c;
  };
  console.log(`Entrées: ${Object.keys(sorted).length}`);
  console.log('Par kind:', count('kind'));
  console.log('Par placement:', count('placement'));
  console.log('Par target:', count('target'));
  console.log(`Abilities exclues: ${excluded}`);
  console.log(`Écrit: ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
