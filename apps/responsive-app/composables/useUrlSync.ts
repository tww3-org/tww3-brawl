import { watch } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useUnitStore } from '~/stores/unitStore'
import { fetchUnit } from '@tww3-brawl/sdk'
import { useGraphQLClient } from './useGraphQLClient'
import type { UnitWithEntityNumberAndBonus } from '~/types/unit'
import { defaultUnitBonus } from '~/types/unit'
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
    return `${unit.selection.unit.unit}|${unit.selection.version.id}`
  }

  /**
   * Décode les paramètres d'URL pour une unité
   */
  function decodeUnitParams(param: string | string[] | undefined): { unit_id: string; version: string } | null {
    if (!param || typeof param !== 'string') {
      return null
    }
    const [unit_id, version] = param.split('|')
    if (!unit_id || !version) {
      return null
    }
    return { unit_id, version }
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
    const decoded = decodeUnitParams(param)
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
        bonus: defaultUnitBonus(),
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
        unitStore.right?.selection?.unit?.unit,
        unitStore.right?.selection?.version?.id,
      ],
      () => {
        updateUrl()
      },
      { immediate: false }
    )
  }

  return {
    updateUrl,
    initializeFromUrl,
    watchStoreChanges,
  }
}

