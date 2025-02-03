import { defineEventHandler, getRouterParam, createError } from 'h3'
import data from '../../data/data_v6.03.json'

type Unit = {
  id: string
  // Add other unit properties here based on your data structure
}

type DataStructure = {
  units: Unit[]
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  try {
    const typedData = data as DataStructure
    const unit = typedData.units?.find((unit) => unit.id === id)
    
    if (!unit) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Unit not found'
      })
    }
    
    return unit
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch unit'
    })
  }
}) 