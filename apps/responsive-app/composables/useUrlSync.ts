import { watch } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useUnitStore } from '~/stores/unitStore'
import { fetchUnit } from '@tww3-brawl/sdk'
import { useGraphQLClient } from './useGraphQLClient'
import type { UnitWithEntityNumberAndBonus, UnitBonus } from '~/types/unit'
import { defaultUnitBonus, UnitBonusPathes } from '~/types/unit'
import { getMaxEntities } from '@tww3-brawl/sdk/src/utils/getMaxEntities'
import { useVersions } from './useVersions'

/**
 * Composable pour synchroniser l'URL avec les sélections d'unités
 */
export function useUrlSync() {
  const route = useRoute()
  const router = useRouter()
  const unitStore = useUnitStore()
  const { data: versions, isLoading: versionsLoading } = useVersions()
  const queryClient = useQueryClient()
  const graphqlClient = useGraphQLClient()

  /**
   * Encode les paramètres d'une unité pour l'URL
   */
  function encodeUnitParams(unit: UnitWithEntityNumberAndBonus | null): string | null {
    if (!unit?.selection?.unit || !unit?.selection?.version) {
      return null
    }
    const parts = [`${unit.selection.unit.unit}`, `${unit.selection.version.id}`]
    
    // Encoder les bonus : seulement ceux qui ont une valeur non nulle
    for (const key of UnitBonusPathes) {
      const value = unit.bonus[key]
      if (value !== undefined && value !== 0) {
        parts.push(`${key}=${value}`)
      }
    }
    
    return parts.join('|')
  }

  /**
   * Décode les paramètres d'URL pour une unité
   */
  function decodeUnitParams(param: string | undefined): { unit_id: string; version: string; bonus: UnitBonus } | null {
    if (!param || typeof param !== 'string') {
      return null
    }
    const parts = param.split('|')
    if (parts.length < 2) {
      return null
    }
    
    const [unit_id, version, ...bonusParts] = parts
    if (!unit_id || !version) {
      return null
    }
    
    // Décoder les bonus
    const bonus = defaultUnitBonus()
    for (const bonusPart of bonusParts) {
      const [key, valueStr] = bonusPart.split('=')
      if (key && valueStr !== undefined) {
        const value = Number.parseFloat(valueStr)
        if (!Number.isNaN(value) && UnitBonusPathes.includes(key as UnitBonusPathes)) {
          bonus[key as UnitBonusPathes] = value
        }
      }
    }
    
    return { unit_id, version, bonus }
  }

  /**
   * Met à jour l'URL avec les unités sélectionnées (sans recharger la page)
   */
  function updateUrl() {
    const leftParam = encodeUnitParams(unitStore.left)
    const rightParam = encodeUnitParams(unitStore.right)

    const query: Record<string, string> = {}
    if (leftParam) {
      query.left = leftParam
    }
    if (rightParam) {
      query.right = rightParam
    }

    // Utilise replace pour éviter d'ajouter une entrée dans l'historique
    router.replace({ query })
  }

  /**
   * Charge une unité depuis les paramètres d'URL
   */
  async function loadUnitFromUrl(
    param: string | string[] | undefined
  ): Promise<UnitWithEntityNumberAndBonus | null> {
    // Normaliser le paramètre : prendre le premier élément si c'est un tableau
    const normalizedParam = Array.isArray(param) ? param[0] : param
    const decoded = decodeUnitParams(normalizedParam)
    if (!decoded) {
      return null
    }

    // Trouver la version
    if (!versions.value) {
      return null
    }
    const version = versions.value.find((v) => v.id === decoded.version)
    if (!version) {
      return null
    }

    // Charger l'unité en utilisant queryClient.fetchQuery pour éviter le problème de contexte
    // Utilise la même structure de queryKey que useUnit pour bénéficier du cache
    const queryKey = ['tww', 'versions', decoded.version, 'units', decoded.unit_id]
    
    try {
      const unit = await queryClient.fetchQuery({
        queryKey,
        queryFn: () => fetchUnit(graphqlClient, decoded.version, decoded.unit_id),
        staleTime: 30 * 60 * 1000, // Cache pour 30 minutes
      })

      if (!unit) {
        return null
      }

      const maxEntityCount = getMaxEntities(unit)
      const defaultEntityCount = Math.min(15, maxEntityCount)

      return {
        selection: {
          unit: unit,
          version: version,
          faction: undefined, // La faction sera déterminée automatiquement lors de la sélection
        },
        entityNumber: defaultEntityCount,
        bonus: decoded.bonus,
      }
    } catch (error) {
      console.error('Error loading unit from URL:', error)
      return null
    }
  }

  /**
   * Initialise les unités depuis l'URL au chargement
   */
  async function initializeFromUrl() {
    const leftParam = route.query.left as string | string[] | undefined
    const rightParam = route.query.right as string | string[] | undefined

    // Attendre que les versions soient chargées
    if (versionsLoading.value) {
      await new Promise<void>((resolve) => {
        const unwatch = watch(versionsLoading, (loading) => {
          if (!loading) {
            unwatch()
            resolve()
          }
        })
      })
    }

    // Vérifier que les versions sont disponibles
    if (!versions.value) {
      return
    }

    if (leftParam) {
      const leftUnit = await loadUnitFromUrl(leftParam)
      if (leftUnit) {
        unitStore.setUnit('left', leftUnit)
      }
    }

    if (rightParam) {
      const rightUnit = await loadUnitFromUrl(rightParam)
      if (rightUnit) {
        unitStore.setUnit('right', rightUnit)
      }
    }
  }

  /**
   * Surveille les changements dans le store et met à jour l'URL
   */
  function watchStoreChanges() {
    watch(
      () => [
        unitStore.left?.selection?.unit?.unit,
        unitStore.left?.selection?.version?.id,
        unitStore.left?.bonus,
        unitStore.right?.selection?.unit?.unit,
        unitStore.right?.selection?.version?.id,
        unitStore.right?.bonus,
      ],
      () => {
        updateUrl()
      },
      { immediate: false, deep: true }
    )
  }

  return {
    updateUrl,
    initializeFromUrl,
    watchStoreChanges,
  }
}

