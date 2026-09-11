import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { millAudio } from '../lib/audio.ts'
import { LINEN, MADDER } from '../lib/palette.ts'
import { punchHoles } from '../lib/punch.ts'
import { reedTightness } from '../lib/reed.ts'
import {
  medianFee,
  RpcPool,
  rpcEndpoints,
  sampleTps,
} from '../lib/rpc.ts'
import type { MillSnap, PickKind, WeftPick } from '../lib/types.ts'
import { isAbort, sleep } from '../lib/util.ts'
import { WARPS, warpAt } from '../lib/warps.ts'

const SLOT_MS = 450
const SLOW_MS = 8000
const SIG_MS = 6500
const CLOTH_CAP = 96

let nextPick = 1

function blank(): MillSnap {
  return {
    shed: 'dark',
    endpoint: null,
    slot: null,
    rttMs: null,
    tps: null,
    feeMicro: null,
    tightness: 0.18,
    mute: false,
    picks: [],
    lastPickId: 0,
    note: 'MILL DARK',
  }
}

export function useMill() {
  const [snap, setSnap] = useState<MillSnap>(blank)
  const snapRef = useRef(snap)
  snapRef.current = snap
  const liveRef = useRef(true)
  const muteRef = useRef(false)

  const patch = useCallback((partial: Partial<MillSnap>) => {
    setSnap((prev) => {
      const next = { ...prev, ...partial }
      snapRef.current = next
      return next
    })
  }, [])

  const pushPick = useCallback((pick: WeftPick) => {
    setSnap((prev) => {
      const picks = [...prev.picks, pick]
      if (picks.length > CLOTH_CAP) picks.splice(0, picks.length - CLOTH_CAP)
      const next = { ...prev, picks, lastPickId: pick.id }
      snapRef.current = next
      return next
    })
  }, [])

  const setMute = useCallback((mute: boolean) => {
    muteRef.current = mute
    millAudio.setMuted(mute)
    patch({ mute })
  }, [patch])

  const unlockAudio = useCallback(() => {
    millAudio.unlock()
    millAudio.setMuted(muteRef.current)
  }, [])

  useEffect(() => {
    const ac = new AbortController()
    const pool = new RpcPool(rpcEndpoints())
    let lastSlot: number | null = null
    let lastSlow = performance.now() - 5000
    let lastSig = performance.now() - 2500
    let watchIndex = 0
    let tps: number | null = null
    let feeMicro: number | null = null
    liveRef.current = true
    patch({ shed: 'seeking', note: 'DRESSING THE WARP' })

    const weave = (
      slot: number,
      kind: PickKind,
      tightness: number,
      extra?: { callsign?: string; warpIndex?: number; dye?: string },
    ) => {
      const warpIndex = extra?.warpIndex ?? slot % WARPS.length
      const yarn = warpAt(warpIndex)
      const pick: WeftPick = {
        id: nextPick++,
        slot,
        kind,
        callsign: extra?.callsign,
        warpIndex,
        dye: extra?.dye ?? (kind === 'snag' ? MADDER : kind === 'plain' ? LINEN : yarn.dye),
        tightness,
        holes: punchHoles(slot + (kind === 'dyed' ? warpIndex : 0), WARPS.length),
      }
      pushPick(pick)
      millAudio.heddle(tightness)
      if (kind !== 'skip') millAudio.shuttle()
    }

    const loop = async () => {
      while (!ac.signal.aborted && liveRef.current) {
        try {
          const t0 = performance.now()
          const slot = await pool.getSlot(ac.signal)
          const rttMs = Math.round(performance.now() - t0)
          const delta = lastSlot == null ? 1 : slot - lastSlot
          const tightness = reedTightness({
            feeMicro,
            tps,
            slotDelta: Math.max(1, delta),
          })

          patch({
            shed: 'open',
            endpoint: pool.url,
            slot,
            rttMs,
            tps,
            feeMicro,
            tightness,
            note: 'WEAVING',
          })

          if (lastSlot == null || slot !== lastSlot) {
            if (lastSlot != null && delta >= 5) {
              weave(slot, 'skip', Math.max(tightness, 0.5))
            }
            weave(slot, 'plain', tightness)
          }
          lastSlot = slot
        } catch (err) {
          if (isAbort(err)) break
          pool.rotate()
          patch({
            shed: 'snagged',
            endpoint: pool.url,
            note: 'SNAGGED — ROTATING MILL',
          })
        }

        if (performance.now() - lastSlow > SLOW_MS) {
          lastSlow = performance.now()
          try {
            const [samples, fees] = await Promise.all([
              pool.getPerf(ac.signal),
              pool.getFees(ac.signal),
            ])
            const stats = sampleTps(samples)
            tps = stats?.tps ?? tps
            feeMicro = medianFee(fees)
            patch({ tps, feeMicro, endpoint: pool.url })
          } catch (err) {
            if (isAbort(err)) break
          }
        }

        if (performance.now() - lastSig > SIG_MS) {
          lastSig = performance.now()
          const watch = warpAt(watchIndex++)
          try {
            const sigs = await pool.getSigs(watch.id, ac.signal)
            const cur = snapRef.current.slot
            const fresh = sigs.filter((s) => cur == null || cur - s.slot < 96)
            if (fresh.length) {
              const tightness = snapRef.current.tightness
              const slot = cur ?? fresh[0]!.slot
              weave(slot, 'dyed', tightness, {
                callsign: watch.callsign,
                warpIndex: WARPS.findIndex((w) => w.callsign === watch.callsign),
                dye: watch.dye,
              })
              const failed = fresh.find((s) => s.err != null)
              if (failed) {
                weave(failed.slot, 'snag', Math.max(tightness, 0.62), {
                  callsign: watch.callsign,
                  warpIndex: WARPS.findIndex((w) => w.callsign === watch.callsign),
                  dye: MADDER,
                })
              }
            }
          } catch (err) {
            if (isAbort(err)) break
          }
        }

        try {
          await sleep(SLOT_MS, ac.signal)
        } catch {
          break
        }
      }
    }

    void loop()
    return () => {
      liveRef.current = false
      ac.abort()
    }
  }, [patch, pushPick])

  return useMemo(
    () => ({ snap, setMute, unlockAudio }),
    [snap, setMute, unlockAudio],
  )
}
