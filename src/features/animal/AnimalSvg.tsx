import faceHamster from '../../assets/46_face_hamster.png'
import faceCat     from '../../assets/47_face_cat.png'
import faceDog     from '../../assets/48_face_dog.png'
import faceRobot   from '../../assets/49_face_robot.png'
import faceFriend  from '../../assets/61_friend.png'

export type AnimalSpecies = 'hamster' | 'cat' | 'dog' | 'robot' | 'friend'

const FACE_IMGS: Record<AnimalSpecies, string> = {
  hamster: faceHamster,
  cat:     faceCat,
  dog:     faceDog,
  robot:   faceRobot,
  friend:  faceFriend,
}

export function AnimalSvg({ species, size }: { species: AnimalSpecies; size: number }) {
  const src = FACE_IMGS[species] ?? FACE_IMGS.robot
  return <img src={src} width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} alt={species}/>
}

// eslint-disable-next-line react-refresh/only-export-components
export function getSpeciesFromId(animalId: string | null): AnimalSpecies {
  if (!animalId) return 'robot'
  if (animalId.startsWith('hamster')) return 'hamster'
  if (animalId.startsWith('cat')) return 'cat'
  if (animalId.startsWith('dog')) return 'dog'
  if (animalId.startsWith('friend')) return 'friend'
  return 'robot'
}
