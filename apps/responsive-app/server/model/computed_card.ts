export interface ComputedCard {
    health: {
        unit: number,
        entity: number
    }
    armor: {
        base: number,
        total: number
    },
    attack: {
        base: number,
        total: number
    },
    defense: {
        base: number,
        total: number
    },
    attack_interval: number,
    damage: {
      normal: {
        base: number,
        total: number
    },
      piercing: {
        base: number,
        total: number
    },
    is_magical: {
        base: boolean,
        total: boolean
    },
    is_fire: {
        base: boolean,
        total: boolean
    },
    bonus_v_large: {
        base: boolean,
        total: boolean
    },
    bonus_v_infantry: {
        base: boolean,
        total: boolean
    }  
},
resistance: {
        physical: {
            base: number,
            total: number
        },
        magical: {
            base: number,
            total: number
        },
        fire: {
            base: number,
            total: number
        },
        ward_save: {
            base: number,
            total: number
        }
    },
    is_large: boolean
}

export function recursiveFinal(object_or_value: any) {
    if (typeof object_or_value === 'object') {
      if (Object.keys(object_or_value).includes("base") && 
      Object.keys(object_or_value).includes("modifier") && 
      Object.keys(object_or_value).includes("total")) {
        let new_object = {  
            base: object_or_value["base"],
            total: object_or_value["total"]    
        }
        return new_object
      } else {
         let new_object: {[key: string]: any} = {}
         for ( let key of Object.keys(object_or_value)) {
          new_object[key] = recursiveFinal(object_or_value[key])
         }
         return new_object
      }
    } else {
      return object_or_value
    }
  }