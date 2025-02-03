import { defineEventHandler, createError } from 'h3'
import data from '../../data/data_v6.03.json'

// Type definition for our data structure
type Unit = {
  id: string
  // Add other unit properties here based on your data structure
}

type DataStructure = {
  units: Unit[]
}

// Get all units
export default defineEventHandler(async (event) => {
  try {
    // Cast data to our type to fix TypeScript errors
    const typedData = data as DataStructure
    return {
      units: typedData.units || []
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch units'
    })
  }
}) 