import beltH    from '../../assets/02_belt_horizontal.png'
import beltV    from '../../assets/03_belt_vertical.png'
import beltTL   from '../../assets/04_belt_corner_tl.png'
import beltTR   from '../../assets/05_belt_corner_tr.png'
import beltBL   from '../../assets/06_belt_corner_bl.png'
import beltBR   from '../../assets/07_belt_corner_br.png'
import rsIcon   from '../../assets/10_rs_waterwheel.png'
import reIcon   from '../../assets/11_re_crate.png'

export function RailIcon({ type, size }: { type: string; size: number }) {
  let src: string
  switch (type) {
    case 'RRN': case 'RLN': src = beltH;  break
    case 'RDN': case 'RUN': src = beltV;  break
    case 'RDR':             src = beltTR; break
    case 'RLR':             src = beltBR; break
    case 'RDL':             src = beltTL; break
    case 'RRL':             src = beltBL; break
    case 'RS':              src = rsIcon; break
    case 'RE':              src = reIcon; break
    default: return null
  }
  return <img src={src} width={size} height={size} style={{ display: 'block', objectFit: 'fill' }} alt=""/>
}
