/** Wooden heddle knock + a short shuttle whoosh. Mill floor, not a synth pad. */
class MillAudio {
  ctx: AudioContext | null = null
  muted = false

  unlock(): void {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctx()
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  setMuted(mute: boolean): void {
    this.muted = mute
  }

  heddle(tightness: number): void {
    if (this.muted) return
    this.unlock()
    const ctx = this.ctx
    if (!ctx) return
    const t = ctx.currentTime
    const thud = ctx.createOscillator()
    const thudGain = ctx.createGain()
    thud.type = 'triangle'
    thud.frequency.setValueAtTime(92 + tightness * 40, t)
    thud.frequency.exponentialRampToValueAtTime(48, t + 0.08)
    thudGain.gain.setValueAtTime(0.12 + tightness * 0.08, t)
    thudGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
    thud.connect(thudGain).connect(ctx.destination)
    thud.start(t)
    thud.stop(t + 0.16)

    const click = ctx.createOscillator()
    const clickGain = ctx.createGain()
    click.type = 'square'
    click.frequency.value = 920 + tightness * 280
    clickGain.gain.setValueAtTime(0.03, t)
    clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)
    click.connect(clickGain).connect(ctx.destination)
    click.start(t)
    click.stop(t + 0.04)
  }

  shuttle(): void {
    if (this.muted) return
    this.unlock()
    const ctx = this.ctx
    if (!ctx) return
    const t = ctx.currentTime
    const dur = 0.22
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1400, t)
    filter.frequency.exponentialRampToValueAtTime(700, t + dur)
    filter.Q.value = 1.4
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.045, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    const pan = ctx.createStereoPanner()
    pan.pan.setValueAtTime(-0.7, t)
    pan.pan.linearRampToValueAtTime(0.7, t + dur)
    src.connect(filter).connect(gain).connect(pan).connect(ctx.destination)
    src.start(t)
  }
}

export const millAudio = new MillAudio()
