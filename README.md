# SLOTLOOM

Live Solana **mainnet** as a Jacquard loom. Not an explorer, not a dashboard, not a newspaper, and not a clone of the other lab toys (hearslot / vfdrack / solflap / slotquake / rpcjelly / slotwire / traceglass).

You are on the mill floor at night. Warp threads are program accounts. Weft picks advance left-to-right as slots tick. Fee pressure tightens the reed. Failed transactions leave a madder knot. Skipped slots break the pick. Hot programs dye a short weft segment with a readable callsign.

Target live: https://robertkodes.github.io/slotloom/

## How to read the cloth

| Loom | Chain |
| --- | --- |
| Vertical warp | Well-known program keys (TKN, JUP, RAY…) |
| Horizontal weft pick | A confirmed slot, or extra dyed pick from recent activity |
| Reed spacing / darkness | Prioritization fees + TPS + skipped-slot gap |
| Madder knot / broken thread | `err` on a watched signature, or a skipped-slot gap |
| Punch-card chain | Hole pattern derived from the slot (twill + walking figure) |
| Shuttle / heddle click | New pick. Mute the peg. `prefers-reduced-motion` skips the fly. |

No wallet. No seeds. No trading. Browser talks JSON-RPC and weaves.

## Palette

Named hex, mill floor, six dyes:

| Token | Hex | Use |
| --- | --- | --- |
| **pitch** | `#1C140E` | Night mill, holes through cards |
| **oak** | `#6E4124` | Loom timber, shuttle hull |
| **lamp** | `#E4A04A` | Oil-lamp tungsten, title |
| **indigo** | `#1F3D6B` | Vat dye, moonlight leak |
| **linen** | `#D4C4A0` | Undyed warp / weft |
| **madder** | `#B33A28` | Snag, failed pick |

Brass (`#C4A15A`) is lamp mixed down for the inspector plate — not a seventh brand color.

## Type

- **Fraunces** — mill nameplate, Lyons italic. Optical serif, not Inter, not a SaaS geometric.
- **Share Tech Mono** — punch-card stencil, HUD stamps, callsigns. Looks punched, not coded.

## Tinkerer notes

```bash
npm i
npm run dev
```

Vite serves at `/slotloom/`. Open that path, not `/`.

```bash
npm run build
```

must pass. GitHub Actions builds and publishes `dist/` to the `gh-pages` branch (base `/slotloom/`). `public/.nojekyll` rides along so GitHub Pages does not eat the files.

Public RPC, rotating on failure:

- `solana-rpc.publicnode.com`
- `api.mainnet-beta.solana.com`
- `solana.drpc.org`
- `rpc.ankr.com/solana`
- `solana.llamarpc.com`

Override with `VITE_RPC_URL`. Methods: `getSlot`, `getRecentPerformanceSamples`, `getRecentPrioritizationFees`, and a slow rotate of `getSignaturesForAddress` across the warp beam.

The loom auto-dresses on load. First pointer unlocks the heddle click (Web Audio). The wooden peg on the brass plate mutes it.

If Pages 404s after merge: GitHub repo Settings → Pages → source **`gh-pages` / root**. The workflow only runs on `main` (and `workflow_dispatch`), so the live URL appears after merge, not on the PR branch.
