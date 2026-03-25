import type { Factory } from '../../types/factory'
import type { AnimalSpecies } from '../animal/AnimalSvg'

import hamsterWA from '../../assets/24_hamster_wa.png'
import hamsterPA from '../../assets/25_hamster_pa.png'
import hamsterPK from '../../assets/26_hamster_pk.png'
import catWA     from '../../assets/27_cat_wa.png'
import catPA     from '../../assets/28_cat_pa.png'
import catPK     from '../../assets/29_cat_pk.png'
import dogWA     from '../../assets/30_dog_wa.png'
import dogPA     from '../../assets/31_dog_pa.png'
import dogPK     from '../../assets/32_dog_pk.png'
import alienWA   from '../../assets/33_alien_wa.png'
import alienPA   from '../../assets/34_alien_pa.png'
import alienPK   from '../../assets/35_alien_pk.png'
import robotWA   from '../../assets/36_robot_wa.png'
import robotPA   from '../../assets/37_robot_pa.png'
import robotPK   from '../../assets/38_robot_pk.png'

const ANIM_IMGS: Record<AnimalSpecies | 'alien', Record<Factory['type'], string>> = {
  hamster: { WA: hamsterWA, PA: hamsterPA, PK: hamsterPK },
  cat:     { WA: catWA,     PA: catPA,     PK: catPK },
  dog:     { WA: dogWA,     PA: dogPA,     PK: dogPK },
  alien:   { WA: alienWA,   PA: alienPA,   PK: alienPK },
  robot:   { WA: robotWA,   PA: robotPA,   PK: robotPK },
}

interface Props {
  type: Factory['type']
  species: AnimalSpecies
  size: number
}

export function ProcessAnimation({ type, species, size }: Props) {
  const src = (ANIM_IMGS[species] ?? ANIM_IMGS.robot)[type]
  return <img src={src} width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} alt=""/>
}
