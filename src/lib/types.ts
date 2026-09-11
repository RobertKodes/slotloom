export type ShedState = 'dark' | 'seeking' | 'open' | 'snagged'

export type PickKind = 'plain' | 'dyed' | 'snag' | 'skip'

export type WeftPick = {
  id: number
  slot: number
  kind: PickKind
  callsign?: string
  warpIndex: number
  dye: string
  tightness: number
  holes: boolean[]
}

export type MillSnap = {
  shed: ShedState
  endpoint: string | null
  slot: number | null
  rttMs: number | null
  tps: number | null
  feeMicro: number | null
  tightness: number
  mute: boolean
  picks: WeftPick[]
  lastPickId: number
  note: string
}

export type ReedFeel = 'slack' | 'set' | 'tight' | 'locked'
