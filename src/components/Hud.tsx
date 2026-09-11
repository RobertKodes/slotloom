import { reedFeel } from '../lib/reed.ts'
import type { MillSnap } from '../lib/types.ts'
import { hostOf } from '../lib/util.ts'

type Props = {
  mill: MillSnap
  onMute: (mute: boolean) => void
}

export function Hud({ mill, onMute }: Props) {
  const feel = reedFeel(mill.tightness)
  return (
    <aside className="plaque" aria-label="Mill inspector plate">
      <div className="plaque-row">
        <span>SLOT</span>
        <b>{mill.slot?.toLocaleString() ?? '—'}</b>
      </div>
      <div className="plaque-row">
        <span>RTT</span>
        <b>{mill.rttMs != null ? `${mill.rttMs}ms` : '—'}</b>
      </div>
      <div className="plaque-row">
        <span>MILL</span>
        <b title={mill.endpoint ?? ''}>{hostOf(mill.endpoint)}</b>
      </div>
      <div className="plaque-row">
        <span>REED</span>
        <b className={`reed-${feel}`}>{feel}</b>
      </div>
      <div className="plaque-row">
        <span>SHED</span>
        <b>{mill.shed}</b>
      </div>
      <button
        type="button"
        className={`peg ${mill.mute ? 'peg-in' : ''}`}
        onClick={() => onMute(!mill.mute)}
        aria-pressed={mill.mute}
      >
        {mill.mute ? 'MUTED' : 'HEDDLE'}
      </button>
    </aside>
  )
}
