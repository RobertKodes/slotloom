export type WarpYarn = {
  id: string
  callsign: string
  /** Hex the weft takes when this program is hot. */
  dye: string
  /** Historical vat name, for the shade card. */
  vat: string
}

/**
 * Warp beam: well-known program accounts as vertical threads.
 * Callsigns stay short — never dump base58 onto the cloth.
 */
export const WARPS: WarpYarn[] = [
  { id: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', callsign: 'TKN', dye: '#8F3B2A', vat: 'madder' },
  { id: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb', callsign: 'T22', dye: '#A85A32', vat: 'cutch' },
  { id: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', callsign: 'ATA', dye: '#6B3F28', vat: 'walnut' },
  { id: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', callsign: 'JUP', dye: '#1F3D6B', vat: 'indigo' },
  { id: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', callsign: 'RAY', dye: '#C9892E', vat: 'weld' },
  { id: 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK', callsign: 'CLM', dye: '#2E5A4A', vat: 'woad' },
  { id: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', callsign: 'ORC', dye: '#3F6B55', vat: 'sap green' },
  { id: 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo', callsign: 'MTR', dye: '#4A2E5C', vat: 'logwood' },
  { id: 'PhoeNiXZ8ByJGLavoGGDMtATPBMDQsBnNsSUTjQHxjV', callsign: 'PHX', dye: '#B33A28', vat: 'cochineal' },
  { id: 'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH', callsign: 'DFT', dye: '#4E6A8A', vat: 'slate' },
  { id: 'KLend2g3cP87fffoy8q1mQqGKjrxjC8oSygPx8HrFRB', callsign: 'KAM', dye: '#7A4B1E', vat: 'fustic' },
  { id: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s', callsign: 'MTX', dye: '#2C4A3A', vat: 'iron' },
  { id: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr', callsign: 'MMO', dye: '#B8A078', vat: 'undyed' },
  { id: 'Stake11111111111111111111111111111111111111', callsign: 'STK', dye: '#5A4630', vat: 'oak gall' },
  { id: 'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX', callsign: 'OBK', dye: '#3A4E6A', vat: 'prussian' },
  { id: 'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD', callsign: 'MRN', dye: '#8A2E3A', vat: 'brazilwood' },
  { id: 'ComputeBudget111111111111111111111111111111', callsign: 'BUD', dye: '#E4A04A', vat: 'lamp' },
  { id: 'AddressLookupTab1e1111111111111111111111111', callsign: 'ALT', dye: '#6E4124', vat: 'oak' },
]

export function warpAt(index: number): WarpYarn {
  return WARPS[index % WARPS.length]!
}
