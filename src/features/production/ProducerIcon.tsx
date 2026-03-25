import pandaGrade1 from '../../assets/21_panda_grade1.png'
import pandaGrade2 from '../../assets/22_panda_grade2.png'
import pandaGrade3 from '../../assets/23_panda_grade3.png'

const PANDA_IMGS = [pandaGrade1, pandaGrade2, pandaGrade3]

export function ProducerAnimation({ grade, size }: { grade: number; size: number }) {
  const src = PANDA_IMGS[Math.min(grade, 3) - 1] ?? pandaGrade1
  return <img src={src} width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} alt=""/>
}
