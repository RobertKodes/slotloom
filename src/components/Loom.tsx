import { useEffect, useRef } from 'react'
import { paintLoom, type LoomMotion } from '../draw/loom.ts'
import type { MillSnap } from '../lib/types.ts'

type Props = {
  mill: MillSnap
  reduced: boolean
}

export function Loom({ mill, reduced }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const millRef = useRef(mill)
  millRef.current = mill
  const motionRef = useRef<LoomMotion>({
    shuttle: 0.5,
    shed: 0,
    reed: 0,
    card: 0,
    lamp: 0.4,
    reduced,
  })
  const pickSeen = useRef(0)
  const fly = useRef({ t0: 0, flying: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(canvas)

    const tick = (now: number) => {
      const snap = millRef.current
      const m = motionRef.current
      m.reduced = reduced
      m.lamp = 0.35 + Math.sin(now / 740) * 0.12 + Math.sin(now / 210) * 0.04
      m.card = reduced ? snap.picks.length * 52 : (m.card * 0.92 + snap.picks.length * 52 * 0.08)

      if (snap.lastPickId !== pickSeen.current) {
        pickSeen.current = snap.lastPickId
        if (!reduced) {
          fly.current = { t0: now, flying: true }
          m.shuttle = 0
          m.shed = 0
          m.reed = 0
        } else {
          m.shuttle = 0.5
          m.shed = 0
          m.reed = 0
        }
      }

      if (fly.current.flying && !reduced) {
        const u = Math.min(1, (now - fly.current.t0) / 320)
        m.shuttle = u
        m.shed = Math.sin(u * Math.PI)
        m.reed = u > 0.72 ? Math.sin((u - 0.72) / 0.28 * Math.PI) : 0
        if (u >= 1) fly.current.flying = false
      } else if (!fly.current.flying) {
        m.shed *= 0.86
        m.reed *= 0.8
      }

      const rect = canvas.getBoundingClientRect()
      paintLoom(ctx, rect.width, rect.height, snap, m)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [reduced])

  return <canvas ref={canvasRef} className="loom-canvas" aria-label="Jacquard loom weaving Solana mainnet" />
}
