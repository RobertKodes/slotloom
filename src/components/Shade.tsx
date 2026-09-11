import { WARPS } from '../lib/warps.ts'

export function Shade() {
  return (
    <aside className="shade" aria-label="Dyer shade card">
      <header>vat book</header>
      <ul>
        {WARPS.map((w) => (
          <li key={w.callsign}>
            <i style={{ background: w.dye }} />
            <em>{w.callsign}</em>
            <span>{w.vat}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
