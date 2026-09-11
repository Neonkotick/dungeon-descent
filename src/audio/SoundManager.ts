/**
 * Procedural SFX via Web Audio API — dark catacomb / crypt lore.
 * No external assets required (Telegram Mini App friendly).
 */

type SfxId =
  | 'click'
  | 'slash'
  | 'hit'
  | 'crit'
  | 'miss'
  | 'block'
  | 'magic'
  | 'heal'
  | 'death'
  | 'boss'
  | 'chest'
  | 'loot'
  | 'levelup'
  | 'break'
  | 'poison'
  | 'step'
  | 'rest'
  | 'defeat'
  | 'victory';

class SoundManagerImpl {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private enabled = true;

  private ensure(): boolean {
    if (!this.enabled) return false;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return true;
  }

  unlock(): void {
    this.ensure();
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
  }

  play(id: SfxId): void {
    if (!this.ensure() || !this.ctx || !this.master) return;
    try {
      switch (id) {
        case 'click':
          this.blip(880, 0.04, 0.08, 'square');
          break;
        case 'slash':
          this.noiseBurst(0.08, 0.12, 1800, 400);
          this.blip(220, 0.05, 0.1, 'sawtooth');
          break;
        case 'hit':
          this.noiseBurst(0.06, 0.18, 800, 120);
          this.blip(90, 0.08, 0.15, 'triangle');
          break;
        case 'crit':
          this.noiseBurst(0.05, 0.2, 2000, 300);
          this.blip(440, 0.06, 0.12, 'square');
          this.blip(660, 0.05, 0.1, 'square', 0.05);
          this.blip(880, 0.08, 0.14, 'square', 0.1);
          break;
        case 'miss':
          this.blip(300, 0.04, 0.06, 'sine');
          this.blip(180, 0.05, 0.05, 'sine', 0.04);
          break;
        case 'block':
          this.blip(150, 0.06, 0.12, 'triangle');
          this.noiseBurst(0.03, 0.08, 600, 200);
          break;
        case 'magic':
          this.blip(520, 0.12, 0.1, 'sine');
          this.blip(780, 0.14, 0.08, 'sine', 0.06);
          this.blip(1040, 0.1, 0.06, 'sine', 0.12);
          break;
        case 'heal':
          this.blip(523, 0.1, 0.08, 'sine');
          this.blip(659, 0.1, 0.08, 'sine', 0.08);
          this.blip(784, 0.14, 0.1, 'sine', 0.16);
          break;
        case 'death':
          this.noiseBurst(0.15, 0.25, 400, 40);
          this.blip(120, 0.2, 0.2, 'sawtooth');
          this.blip(60, 0.25, 0.15, 'triangle', 0.1);
          break;
        case 'boss':
          this.noiseBurst(0.2, 0.3, 300, 50);
          this.blip(55, 0.3, 0.25, 'sawtooth');
          this.blip(40, 0.35, 0.2, 'triangle', 0.05);
          break;
        case 'chest':
          this.blip(200, 0.05, 0.1, 'square');
          this.blip(400, 0.06, 0.08, 'square', 0.06);
          this.noiseBurst(0.04, 0.1, 1500, 800);
          break;
        case 'loot':
          this.blip(660, 0.06, 0.08, 'sine');
          this.blip(880, 0.07, 0.08, 'sine', 0.07);
          this.blip(1320, 0.1, 0.1, 'sine', 0.14);
          break;
        case 'levelup':
          [523, 659, 784, 1046].forEach((f, i) => this.blip(f, 0.12, 0.1, 'square', i * 0.08));
          break;
        case 'break':
          this.noiseBurst(0.1, 0.22, 1200, 100);
          this.blip(180, 0.1, 0.15, 'sawtooth');
          this.blip(90, 0.15, 0.12, 'triangle', 0.05);
          break;
        case 'poison':
          this.blip(160, 0.15, 0.06, 'sine');
          this.blip(140, 0.18, 0.05, 'sine', 0.1);
          break;
        case 'step':
          this.noiseBurst(0.02, 0.05, 200, 80);
          break;
        case 'rest':
          this.blip(392, 0.2, 0.08, 'sine');
          this.blip(494, 0.25, 0.08, 'sine', 0.15);
          break;
        case 'defeat':
          this.blip(220, 0.2, 0.15, 'triangle');
          this.blip(165, 0.25, 0.15, 'triangle', 0.15);
          this.blip(110, 0.35, 0.2, 'triangle', 0.3);
          break;
        case 'victory':
          [392, 494, 587, 784].forEach((f, i) => this.blip(f, 0.15, 0.12, 'square', i * 0.1));
          break;
        default:
          this.blip(440, 0.05, 0.08, 'sine');
      }
    } catch {
      /* ignore */
    }
  }

  private blip(
    freq: number,
    dur: number,
    vol: number,
    type: OscillatorType,
    delay = 0
  ): void {
    if (!this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.7), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private noiseBurst(dur: number, vol: number, startFreq: number, endFreq: number): void {
    if (!this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(startFreq, t0);
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), t0 + dur);
    filter.Q.value = 1.2;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(t0);
  }
}

export const SoundManager = new SoundManagerImpl();
