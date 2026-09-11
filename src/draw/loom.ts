import {
  BRASS,
  INDIGO,
  LAMP,
  LINEN,
  LINEN_DIM,
  MADDER,
  OAK,
  OAK_DARK,
  OAK_LIT,
  PAPER,
  PITCH,
  SOOT,
} from '../lib/palette.ts'
import type { MillSnap, WeftPick } from '../lib/types.ts'
import { mulberry32 } from '../lib/util.ts'
import { WARPS } from '../lib/warps.ts'

export type LoomMotion = {
  shuttle: number
  shed: number
  reed: number
  card: number
  lamp: number
  reduced: boolean
}

type Box = { x: number; y: number; w: number; h: number }

function mix(a: string, b: string, t: number): string {
  const pa = hex(a)
  const pb = hex(b)
  const m = (i: number) => Math.round(pa[i]! + (pb[i]! - pa[i]!) * t)
  return `rgb(${m(0)}, ${m(1)}, ${m(2)})`
}

function hex(c: string): [number, number, number] {
  const n = c.replace('#', '')
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ]
}

function fillWood(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
  vertical = false,
): void {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  const g = ctx.createLinearGradient(x, y, x + (vertical ? 0 : w), y + (vertical ? h : 0))
  g.addColorStop(0, OAK_DARK)
  g.addColorStop(0.35, OAK)
  g.addColorStop(0.7, OAK_LIT)
  g.addColorStop(1, OAK_DARK)
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  const rnd = mulberry32(seed)
  ctx.strokeStyle = 'rgba(20, 10, 4, 0.28)'
  ctx.lineWidth = 0.8
  const count = Math.floor((vertical ? w : h) / 3.4)
  for (let i = 0; i < count; i++) {
    const o = (vertical ? x : y) + i * 3.4 + rnd() * 1.6
    ctx.beginPath()
    if (vertical) {
      ctx.moveTo(o, y)
      ctx.bezierCurveTo(o + rnd() * 2 - 1, y + h * 0.3, o + rnd() * 2 - 1, y + h * 0.7, o, y + h)
    } else {
      ctx.moveTo(x, o)
      ctx.bezierCurveTo(x + w * 0.3, o + rnd() * 2 - 1, x + w * 0.7, o + rnd() * 2 - 1, x + w, o)
    }
    ctx.stroke()
  }
  ctx.restore()
}

function warpX(i: number, n: number, box: Box, tightness: number): number {
  const pad = 18
  const t = n <= 1 ? 0.5 : i / (n - 1)
  const even = box.x + pad + t * (box.w - pad * 2)
  const squeeze = 0.18 + tightness * 0.32
  const mid = box.x + box.w / 2
  return even * (1 - squeeze) + mid * squeeze
}

export function paintLoom(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  mill: MillSnap,
  motion: LoomMotion,
): void {
  ctx.clearRect(0, 0, w, h)
  paintFloor(ctx, w, h, motion.lamp)
  const frame: Box = {
    x: Math.round(w * 0.16),
    y: Math.round(h * 0.07),
    w: Math.round(w * 0.72),
    h: Math.round(h * 0.86),
  }

  paintHangingCards(ctx, frame, mill.picks, motion.card)
  paintFrame(ctx, frame)
  paintJacquardHead(ctx, frame, mill, motion)

  const inner: Box = {
    x: frame.x + 28,
    y: frame.y + Math.round(frame.h * 0.2),
    w: frame.w - 56,
    h: Math.round(frame.h * 0.68),
  }

  const n = WARPS.length
  const tightness = mill.tightness
  const xs = Array.from({ length: n }, (_, i) => warpX(i, n, inner, tightness))
  const heddleY = inner.y + 18
  const shedY = inner.y + inner.h * 0.16
  const reedY = inner.y + inner.h * 0.28 + motion.reed * 7
  const fellY = reedY + 16
  const beamY = inner.y + inner.h - 8

  paintWarps(ctx, xs, heddleY - 24, beamY, mill, motion, tightness)
  paintHeddles(ctx, xs, heddleY, motion.shed)
  paintReed(ctx, inner, xs, reedY, tightness)
  paintCloth(ctx, xs, fellY, beamY, mill.picks, tightness)
  paintShuttle(ctx, inner, shedY, mill, motion)
  paintClothBeam(ctx, inner, beamY, mill.picks.length)
  paintLamp(ctx, w, h, motion.lamp)
  paintStamp(ctx, frame)
}

function paintFloor(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  lamp: number,
): void {
  const g = ctx.createRadialGradient(w * 0.62, h * 0.18, 20, w * 0.45, h * 0.55, Math.max(w, h))
  g.addColorStop(0, mix(PITCH, LAMP, 0.08 + lamp * 0.04))
  g.addColorStop(0.45, PITCH)
  g.addColorStop(1, SOOT)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  const moon = ctx.createRadialGradient(w * 0.08, h * 0.1, 10, w * 0.08, h * 0.1, w * 0.4)
  moon.addColorStop(0, mix(INDIGO, '#ffffff', 0.08))
  moon.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = moon
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  ctx.lineWidth = 1
  for (let y = 0; y < h; y += 22) {
    ctx.beginPath()
    ctx.moveTo(0, y + (y % 44 === 0 ? 2 : 0))
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  const rnd = mulberry32(42)
  ctx.fillStyle = 'rgba(212, 196, 160, 0.07)'
  for (let i = 0; i < 70; i++) {
    ctx.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1)
  }
}

function paintFrame(ctx: CanvasRenderingContext2D, f: Box): void {
  fillWood(ctx, f.x, f.y, 26, f.h, 11, true)
  fillWood(ctx, f.x + f.w - 26, f.y, 26, f.h, 17, true)
  fillWood(ctx, f.x, f.y, f.w, 22, 3, false)
  fillWood(ctx, f.x, f.y + f.h - 28, f.w, 28, 29, false)
  fillWood(ctx, f.x + 20, f.y + Math.round(f.h * 0.18), f.w - 40, 14, 41, false)

  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.fillRect(f.x + 26, f.y + 22, 8, f.h - 50)
  ctx.fillRect(f.x + f.w - 34, f.y + 22, 8, f.h - 50)

  // iron bolts
  ctx.fillStyle = BRASS
  for (const [bx, by] of [
    [f.x + 13, f.y + 11],
    [f.x + f.w - 13, f.y + 11],
    [f.x + 13, f.y + f.h - 14],
    [f.x + f.w - 13, f.y + f.h - 14],
  ] as const) {
    ctx.beginPath()
    ctx.arc(bx, by, 3.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = OAK_DARK
    ctx.beginPath()
    ctx.arc(bx, by, 1.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = BRASS
  }
}

function paintJacquardHead(
  ctx: CanvasRenderingContext2D,
  f: Box,
  mill: MillSnap,
  motion: LoomMotion,
): void {
  const head: Box = {
    x: f.x + 36,
    y: f.y + 8,
    w: f.w - 72,
    h: Math.round(f.h * 0.16),
  }
  fillWood(ctx, head.x, head.y, head.w, head.h, 71, false)
  ctx.fillStyle = SOOT
  ctx.fillRect(head.x + 10, head.y + 8, head.w - 20, head.h - 16)

  // cylinder
  const cy = head.y + head.h * 0.55
  const cx = head.x + head.w * 0.5
  ctx.fillStyle = OAK_LIT
  ctx.beginPath()
  ctx.ellipse(cx, cy, 28, 16, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = OAK_DARK
  ctx.lineWidth = 2
  ctx.stroke()

  const cardW = 46
  const cardH = head.h - 22
  const nCards = Math.min(12, Math.max(6, Math.floor(head.w / 52)))
  const shift = motion.reduced ? mill.picks.length * cardW : motion.card
  for (let i = -1; i < nCards + 1; i++) {
    const pick = mill.picks[Math.max(0, mill.picks.length - nCards + i)]
    const x = head.x + 16 + i * (cardW + 6) - (shift % (cardW + 6))
    paintCard(ctx, x, head.y + 10, cardW, cardH, pick ?? null, i + mill.picks.length)
  }

  ctx.fillStyle = mix(LAMP, PAPER, 0.35)
  ctx.font = '10px "Share Tech Mono", monospace'
  ctx.textAlign = 'left'
  ctx.fillText('JACQUARD  ·  PATTERN CHAIN', head.x + 14, head.y + 7)
}

function paintCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  pick: WeftPick | null,
  seed: number,
): void {
  ctx.fillStyle = PAPER
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = mix(OAK, PITCH, 0.4)
  ctx.lineWidth = 1
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)
  const cols = 8
  const rows = 6
  const holes = pick?.holes ?? []
  const rnd = mulberry32(seed + 99)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const punched = holes.length
        ? holes[(r * cols + c) % holes.length]
        : rnd() > 0.62
      const hx = x + 6 + c * ((w - 12) / (cols - 1))
      const hy = y + 8 + r * ((h - 16) / (rows - 1))
      ctx.beginPath()
      ctx.arc(hx, hy, 1.7, 0, Math.PI * 2)
      if (punched) {
        ctx.fillStyle = PITCH
        ctx.fill()
      } else {
        ctx.fillStyle = mix(PAPER, OAK, 0.15)
        ctx.fill()
        ctx.strokeStyle = mix(OAK, PAPER, 0.5)
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    }
  }
  if (pick?.callsign) {
    ctx.fillStyle = pick.kind === 'snag' ? MADDER : INDIGO
    ctx.font = '8px "Share Tech Mono", monospace'
    ctx.textAlign = 'center'
    ctx.fillText(pick.callsign, x + w / 2, y + h - 3)
  }
}

function paintHangingCards(
  ctx: CanvasRenderingContext2D,
  f: Box,
  picks: WeftPick[],
  cardShift: number,
): void {
  const used = picks.slice(-8)
  let y = f.y + 40
  used.forEach((p, i) => {
    const x = f.x - 58 + Math.sin((cardShift + i) * 0.04) * 3
    paintCard(ctx, x, y, 42, 54, p, p.id)
    ctx.strokeStyle = LINEN_DIM
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(x + 42, y + 8)
    ctx.lineTo(f.x + 8, y + 4)
    ctx.stroke()
    y += 58
  })
}

function paintWarps(
  ctx: CanvasRenderingContext2D,
  xs: number[],
  y0: number,
  y1: number,
  mill: MillSnap,
  motion: LoomMotion,
  tightness: number,
): void {
  xs.forEach((x, i) => {
    const yarn = WARPS[i]!
    const lift = mill.picks.length
      ? (mill.picks[mill.picks.length - 1]!.holes[i] ? 1 : 0)
      : i % 2
    const shed = motion.reduced ? 0 : motion.shed * 11 * (lift ? 1 : -1)
    ctx.strokeStyle = mix(LINEN, yarn.dye, 0.18 + tightness * 0.2)
    ctx.lineWidth = 1.15 + (i % 3 === 0 ? 0.35 : 0)
    ctx.beginPath()
    ctx.moveTo(x, y0)
    ctx.bezierCurveTo(x + shed * 0.15, y0 + (y1 - y0) * 0.22, x + shed, (y0 + y1) / 2, x, y1)
    ctx.stroke()
  })
}

function paintHeddles(
  ctx: CanvasRenderingContext2D,
  xs: number[],
  y: number,
  shed: number,
): void {
  ctx.strokeStyle = mix(BRASS, OAK_DARK, 0.4)
  ctx.lineWidth = 1
  xs.forEach((x, i) => {
    const lift = (i % 2 === 0 ? 1 : -1) * shed * 10
    ctx.beginPath()
    ctx.moveTo(x, y - 14 + lift)
    ctx.lineTo(x, y + 14 + lift)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(x, y + lift, 3.2, 2.1, 0, 0, Math.PI * 2)
    ctx.strokeStyle = BRASS
    ctx.stroke()
    ctx.strokeStyle = mix(BRASS, OAK_DARK, 0.4)
  })
}

function paintReed(
  ctx: CanvasRenderingContext2D,
  inner: Box,
  xs: number[],
  y: number,
  tightness: number,
): void {
  const h = 18
  fillWood(ctx, inner.x, y - 6, inner.w, 6, 201, false)
  fillWood(ctx, inner.x, y + h - 2, inner.w, 6, 203, false)
  ctx.strokeStyle = mix(BRASS, PITCH, tightness * 0.4)
  ctx.lineWidth = 0.9 + tightness * 0.6
  xs.forEach((x) => {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, y + h)
    ctx.stroke()
  })
}

function paintCloth(
  ctx: CanvasRenderingContext2D,
  xs: number[],
  fellY: number,
  beamY: number,
  picks: WeftPick[],
  tightness: number,
): void {
  if (!picks.length) return
  const room = Math.max(24, beamY - fellY - 10)
  const rowH = Math.min(7, room / Math.max(1, picks.length))
  const n = xs.length

  picks.forEach((pick, pi) => {
    const fromEnd = picks.length - 1 - pi
    const y = fellY + fromEnd * rowH
    if (y > beamY - 6) return
    const base = pick.kind === 'plain'
      ? mix(LINEN, PITCH, tightness * 0.35)
      : pick.kind === 'skip'
        ? mix(LINEN_DIM, PITCH, 0.4)
        : pick.dye
    const dyeStart = Math.max(0, pick.warpIndex - 2)
    const dyeEnd = Math.min(n - 1, pick.warpIndex + 2)

    if (pick.kind === 'skip') {
      ctx.strokeStyle = mix(MADDER, LINEN_DIM, 0.35)
      ctx.lineWidth = 1.4
      ctx.setLineDash([3, 4])
      ctx.beginPath()
      ctx.moveTo(xs[0]!, y)
      ctx.lineTo(xs[Math.floor(n / 3)]!, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(xs[Math.floor((n * 2) / 3)]!, y)
      ctx.lineTo(xs[n - 1]!, y)
      ctx.stroke()
      ctx.setLineDash([])
      // broken ends
      ctx.strokeStyle = MADDER
      ctx.beginPath()
      const midL = xs[Math.floor(n / 3)]!
      const midR = xs[Math.floor((n * 2) / 3)]!
      ctx.moveTo(midL, y)
      ctx.lineTo(midL + 6, y + 5)
      ctx.moveTo(midR, y)
      ctx.lineTo(midR - 6, y + 5)
      ctx.stroke()
      return
    }

    ctx.lineWidth = 1.35 + tightness * 0.9
    ctx.lineJoin = 'round'
    ctx.beginPath()
    xs.forEach((x, i) => {
      const over = pick.holes[i] ?? i % 2 === 0
      const yy = y + (over ? -1.2 : 1.2)
      const colored = pick.kind !== 'plain' && i >= dyeStart && i <= dyeEnd
      if (i === 0) ctx.moveTo(x, yy)
      else ctx.lineTo(x, yy)
      if (colored && i === dyeStart) {
        ctx.strokeStyle = mix(base, PITCH, tightness * 0.15)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, yy)
        ctx.strokeStyle = pick.dye
      }
      if (colored && i === dyeEnd) {
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, yy)
      }
    })
    ctx.strokeStyle = mix(base, PITCH, tightness * 0.22)
    ctx.stroke()

    if (pick.kind === 'snag') {
      const x = xs[pick.warpIndex] ?? xs[Math.floor(n / 2)]!
      ctx.fillStyle = MADDER
      ctx.beginPath()
      ctx.arc(x, y, 3.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = mix(MADDER, LAMP, 0.3)
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.arc(x + 2.2, y - 1.4, 2.4, 0, Math.PI * 1.6)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + 7, y - 6)
      ctx.stroke()
    }

    if (pick.callsign && fromEnd < 3 && pick.kind === 'dyed') {
      const x = xs[Math.min(n - 1, pick.warpIndex + 3)] ?? xs[n - 1]!
      ctx.fillStyle = mix(PAPER, pick.dye, 0.3)
      ctx.font = '8px "Share Tech Mono", monospace'
      ctx.textAlign = 'left'
      ctx.fillText(pick.callsign, x + 4, y - 2)
    }
  })
}

function paintShuttle(
  ctx: CanvasRenderingContext2D,
  inner: Box,
  y: number,
  mill: MillSnap,
  motion: LoomMotion,
): void {
  const last = mill.picks[mill.picks.length - 1]
  const t = motion.reduced ? 0.5 : motion.shuttle
  const x = inner.x + 36 + t * (inner.w - 72)
  ctx.save()
  ctx.translate(x, y)
  if (!motion.reduced && t > 0.02 && t < 0.98) ctx.rotate(t > 0.5 ? 0.04 : -0.04)

  ctx.fillStyle = OAK
  ctx.beginPath()
  ctx.moveTo(-22, 0)
  ctx.quadraticCurveTo(-18, -7, -6, -8)
  ctx.lineTo(10, -7)
  ctx.quadraticCurveTo(18, -2, 24, 0)
  ctx.quadraticCurveTo(18, 2, 10, 7)
  ctx.lineTo(-6, 8)
  ctx.quadraticCurveTo(-18, 7, -22, 0)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = OAK_DARK
  ctx.lineWidth = 1.2
  ctx.stroke()

  ctx.fillStyle = last?.dye ?? LINEN
  ctx.beginPath()
  ctx.ellipse(-2, 0, 7, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = mix(PITCH, last?.dye ?? LINEN, 0.3)
  ctx.stroke()
  ctx.restore()

  if (last?.kind === 'dyed' && last.callsign) {
    ctx.fillStyle = LAMP
    ctx.font = '9px "Share Tech Mono", monospace'
    ctx.textAlign = 'center'
    ctx.fillText(last.callsign, x, y - 14)
  }
}

function paintClothBeam(
  ctx: CanvasRenderingContext2D,
  inner: Box,
  y: number,
  pickCount: number,
): void {
  fillWood(ctx, inner.x - 6, y - 10, inner.w + 12, 20, 310, false)
  ctx.fillStyle = mix(LINEN, OAK, 0.45)
  ctx.beginPath()
  ctx.ellipse(inner.x - 4, y, 7, 11, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(inner.x + inner.w + 4, y, 7, 11, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = BRASS
  ctx.font = '10px "Share Tech Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`CLOTH BEAM  ·  ${pickCount} PICKS`, inner.x + inner.w / 2, y + 4)
}

function paintLamp(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  lamp: number,
): void {
  const g = ctx.createRadialGradient(w * 0.78, h * 0.08, 8, w * 0.78, h * 0.08, w * 0.55)
  g.addColorStop(0, `rgba(228, 160, 74, ${0.07 + lamp * 0.05})`)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // oil lamp body, upper right, not a UI widget
  ctx.save()
  ctx.translate(w * 0.9, h * 0.08)
  ctx.fillStyle = mix(BRASS, LAMP, 0.3)
  ctx.beginPath()
  ctx.ellipse(0, 18, 10, 14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = LAMP
  ctx.globalAlpha = 0.55 + lamp * 0.35
  ctx.beginPath()
  ctx.moveTo(-4, 2)
  ctx.quadraticCurveTo(0, -16 - lamp * 6, 4, 2)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.restore()
}

function paintStamp(ctx: CanvasRenderingContext2D, f: Box): void {
  ctx.save()
  ctx.translate(f.x + 38, f.y + f.h - 18)
  ctx.rotate(-0.02)
  ctx.fillStyle = mix(LAMP, BRASS, 0.2)
  ctx.font = 'italic 13px Fraunces, serif'
  ctx.textAlign = 'left'
  ctx.fillText('Lyons Pattern Hall  ·  mainnet warp', 0, 0)
  ctx.restore()
}
