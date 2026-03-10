type HamsterId = 'hamster1' | 'hamster2' | 'hamster3' | 'hamster4' | 'hamster5'
  | 'hamster6' | 'hamster7' | 'hamster8' | 'hamster9' | 'hamster10'
  | 'hamster11' | 'hamster12' | 'hamster13' | 'hamster14' | 'hamster15'
  | 'hamster16' | 'hamster17' | 'hamster18' | 'hamster19' | 'hamster20'

type CatId = 'cat1' | 'cat2' | 'cat3' | 'cat4' | 'cat5'
  | 'cat6' | 'cat7' | 'cat8' | 'cat9' | 'cat10'
  | 'cat11' | 'cat12' | 'cat13' | 'cat14' | 'cat15'
  | 'cat16' | 'cat17' | 'cat18' | 'cat19' | 'cat20'

type DogId = 'dog1' | 'dog2' | 'dog3' | 'dog4' | 'dog5'
  | 'dog6' | 'dog7' | 'dog8' | 'dog9' | 'dog10'
  | 'dog11' | 'dog12' | 'dog13' | 'dog14' | 'dog15'
  | 'dog16' | 'dog17' | 'dog18' | 'dog19' | 'dog20'

export type AnimalId = HamsterId | CatId | DogId

export interface Animal {
  id: AnimalId
  level: number      // 업그레이드 레벨 (1+)
  unlocked: boolean
}

export const ANIMAL_IDS: AnimalId[] = [
  ...Array.from({ length: 20 }, (_, i) => `hamster${i + 1}` as AnimalId),
  ...Array.from({ length: 20 }, (_, i) => `cat${i + 1}` as AnimalId),
  ...Array.from({ length: 20 }, (_, i) => `dog${i + 1}` as AnimalId),
]

export const ANIMAL_NAMES: Record<AnimalId, string> = Object.fromEntries(
  ANIMAL_IDS.map(id => {
    const match = id.match(/^([a-z]+)(\d+)$/)!
    const [, type, num] = match
    const typeName = type === 'hamster' ? '햄스터' : type === 'cat' ? '고양이' : '강아지'
    return [id, `${num}.${typeName}`]
  })
) as Record<AnimalId, string>

export const initialAnimals: Animal[] = ANIMAL_IDS.map(id => ({
  id,
  level: 1,
  unlocked: false,
}))
