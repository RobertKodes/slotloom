import { Hud } from './components/Hud.tsx'
import { Loom } from './components/Loom.tsx'
import { Shade } from './components/Shade.tsx'
import { useMill } from './hooks/useMill.ts'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.ts'

export default function App() {
  const { snap, setMute, unlockAudio } = useMill()
  const reduced = usePrefersReducedMotion()

  return (
    <div className="floor" onPointerDown={unlockAudio}>
      <header className="mill-stamp">
        <p className="eyebrow">RobertKodes Lab · not an explorer</p>
        <h1>SLOTLOOM</h1>
        <p className="hall">Lyons Pattern Hall</p>
        <p className="note">{snap.note}</p>
      </header>
      <Hud mill={snap} onMute={setMute} />
      <Shade />
      <Loom mill={snap} reduced={reduced} />
      <p className="legend">
        warp = programs · weft = slots · dye = hot callsigns · madder knot = failed tx · skipped pick = missed slots
      </p>
    </div>
  )
}
