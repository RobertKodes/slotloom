import type { ReedFeel } from './types.ts'

/** Reed tightness from fee pressure, TPS load, and skipped slots. */
export function reedTightness(args: {
  feeMicro: number | null
  tps: number | null
  slotDelta: number
}): number {
  const fee =
    args.feeMicro == null ? 0 : Math.min(1, Math.log10(1 + args.feeMicro) / 5)
  const load = args.tps == null ? 0 : Math.min(1, args.tps / 4500)
  const skip = Math.min(1, Math.max(0, (args.slotDelta - 1) / 10))
  return Math.min(1, fee * 0.48 + load * 0.37 + skip * 0.28)
}

export function reedFeel(tightness: number): ReedFeel {
  if (tightness < 0.22) return 'slack'
  if (tightness < 0.48) return 'set'
  if (tightness < 0.74) return 'tight'
  return 'locked'
}
