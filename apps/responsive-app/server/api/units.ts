import { defineEventHandler } from 'h3'
import data from '../data/data_v6.03.json'

// Get all units
export default defineEventHandler(async (event) => {
  try {
    // Here we assume units are stored in the data object
    // You might need to adjust this based on your actual data structure
    return {
      units: data.units || []
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch units'
    })
  }
})

// Get unit by id
export const getUnitById = defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  try {
    const unit = data.units?.find((unit: any) => unit.id === id)
    
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