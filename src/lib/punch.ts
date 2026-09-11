/** Punch-card holes for a pick: 4-shaft twill plus a walking Jacquard figure. */
export function punchHoles(slot: number, warpCount: number): boolean[] {
  const holes: boolean[] = []
  const walk = slot % Math.max(1, warpCount)
  for (let i = 0; i < warpCount; i++) {
    const twill = ((i + slot) % 4) < 2
    const figure = Math.abs(i - walk) < 2 || Math.abs(i - ((walk + 7) % warpCount)) < 1
    const bit = ((slot >> (i % 16)) & 1) === 1
    holes.push(twill !== bit || figure)
  }
  return holes
}
