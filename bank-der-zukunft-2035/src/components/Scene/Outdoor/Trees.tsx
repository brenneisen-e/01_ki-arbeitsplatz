import type { ThemeMode } from '../../../types'

interface TreesProps { theme: ThemeMode }

/** Tree-Cluster links und rechts vom Gebäude. Sehr stilisiert, monochrom. */
export function Trees({ theme }: TreesProps) {
  const trunk  = theme === 'night' ? '#3a2a14' : '#5a4225'
  const crown  = theme === 'night' ? '#22422f' : '#3a6a3f'
  const crown2 = theme === 'night' ? '#1a3023' : '#2f5a32'

  return (
    <g>
      {/* Linker Cluster */}
      <Tree x={130} y={760} h={160} trunk={trunk} crown={crown} crown2={crown2} />
      <Tree x={230} y={780} h={120} trunk={trunk} crown={crown2} crown2={crown} />
      <Tree x={310} y={770} h={100} trunk={trunk} crown={crown} crown2={crown2} />
      {/* Rechter Cluster */}
      <Tree x={1300} y={770} h={130} trunk={trunk} crown={crown} crown2={crown2} />
      <Tree x={1410} y={760} h={170} trunk={trunk} crown={crown2} crown2={crown} />
      <Tree x={1510} y={780} h={110} trunk={trunk} crown={crown} crown2={crown2} />
    </g>
  )
}

interface TreeProps { x: number; y: number; h: number; trunk: string; crown: string; crown2: string }
function Tree({ x, y, h, trunk, crown, crown2 }: TreeProps) {
  const tw = Math.max(8, h * 0.07)
  const cr = h * 0.35
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Stamm */}
      <rect x={-tw / 2} y={-h * 0.55} width={tw} height={h * 0.55} fill={trunk} />
      {/* Krone (zwei überlappende Kreise) */}
      <circle cx={0}      cy={-h * 0.55} r={cr}        fill={crown}  />
      <circle cx={cr * 0.55} cy={-h * 0.65} r={cr * 0.85} fill={crown2} />
      <circle cx={-cr * 0.5} cy={-h * 0.65} r={cr * 0.8}  fill={crown}  />
    </g>
  )
}
