export class AudioManager {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientNodes: OscillatorNode[] = [];
  private rainSource: AudioBufferSourceNode | null = null;
  private currentTrack: string = '';
  private musicGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private isEnabled: boolean = true;

  init() {
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.6;
      this.masterGain.connect(this.audioCtx.destination);

      this.musicGain = this.audioCtx.createGain();
      this.musicGain.gain.value = 0.4;
      this.musicGain.connect(this.masterGain);

      this.ambientGain = this.audioCtx.createGain();
      this.ambientGain.gain.value = 0.3;
      this.ambientGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio API not available');
    }
  }

  resume() {
    if (this.audioCtx?.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private createNoise(duration: number = 2): AudioBuffer | null {
    if (!this.audioCtx) return null;
    const sampleRate = this.audioCtx.sampleRate;
    const buffer = this.audioCtx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playRain(intensity: number = 0.5) {
    if (!this.audioCtx || !this.ambientGain) return;
    this.stopRain();
    const noise = this.createNoise(2);
    if (!noise) return;

    const source = this.audioCtx.createBufferSource();
    source.buffer = noise;
    source.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;

    const gainNode = this.audioCtx.createGain();
    gainNode.gain.value = intensity * 0.4;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ambientGain);
    source.start();
    this.rainSource = source;
  }

  stopRain() {
    try { this.rainSource?.stop(); } catch (_) {}
    this.rainSource = null;
  }

  playCrickets() {
    if (!this.audioCtx || !this.ambientGain) return;
    this.stopAmbient();
    const freqs = [2800, 3200, 4100];
    freqs.forEach(freq => {
      const osc = this.audioCtx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = this.audioCtx!.createGain();
      gain.gain.value = 0.02;
      const lfo = this.audioCtx!.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 8 + Math.random() * 4;
      const lfoGain = this.audioCtx!.createGain();
      lfoGain.gain.value = 0.01;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      osc.connect(gain);
      gain.connect(this.ambientGain!);
      osc.start();
      lfo.start();
      this.ambientNodes.push(osc, lfo);
    });
  }

  stopAmbient() {
    this.ambientNodes.forEach(n => { try { n.stop(); } catch (_) {} });
    this.ambientNodes = [];
  }

  playNote(freq: number, duration: number = 0.5, volume: number = 0.1) {
    if (!this.audioCtx || !this.musicGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(this.audioCtx.currentTime);
    osc.stop(this.audioCtx.currentTime + duration + 0.1);
  }

  private melodies: Record<string, number[][]> = {
    morning_acoustic: [
      [261.63, 293.66, 329.63, 392.00],
      [349.23, 392.00, 440.00, 523.25],
    ],
    summer_memories: [
      [523.25, 587.33, 659.25, 783.99],
      [698.46, 659.25, 587.33, 523.25],
    ],
    mystical_night: [
      [220.00, 246.94, 261.63, 311.13],
      [293.66, 261.63, 246.94, 220.00],
    ],
    nostalgic_piano: [
      [329.63, 369.99, 392.00, 440.00],
      [415.30, 392.00, 349.23, 329.63],
    ],
    night_ambient: [
      [130.81, 146.83, 164.81, 196.00],
      [174.61, 196.00, 220.00, 261.63],
    ],
  };

  private melodyTimer: ReturnType<typeof setInterval> | null = null;
  private melodyIndex = 0;
  private noteIndex = 0;

  playMusicTrack(trackId: string) {
    if (trackId === this.currentTrack) return;
    this.currentTrack = trackId;
    this.stopMusic();
    const melody = this.melodies[trackId] || this.melodies['morning_acoustic'];

    const playNextNote = () => {
      if (!this.isEnabled) return;
      const row = melody[this.melodyIndex % melody.length];
      const freq = row[this.noteIndex % row.length];
      this.playNote(freq, 0.8, 0.08);
      this.noteIndex++;
      if (this.noteIndex >= row.length) {
        this.noteIndex = 0;
        this.melodyIndex++;
      }
    };

    this.melodyTimer = setInterval(playNextNote, 500);
    playNextNote();
  }

  stopMusic() {
    if (this.melodyTimer) {
      clearInterval(this.melodyTimer);
      this.melodyTimer = null;
    }
    this.melodyIndex = 0;
    this.noteIndex = 0;
    this.currentTrack = '';
  }

  setMasterVolume(v: number) {
    if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, v));
  }

  setEnabled(v: boolean) {
    this.isEnabled = v;
    if (!v) { this.stopMusic(); this.stopAmbient(); this.stopRain(); }
  }

  playPurr() {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 25;
    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 1.5);
  }

  playMeow() {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.audioCtx.currentTime + 0.3);
    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.5);
  }

  playThunder() {
    if (!this.audioCtx || !this.masterGain) return;
    const noise = this.createNoise(3);
    if (!noise) return;
    const source = this.audioCtx.createBufferSource();
    source.buffer = noise;
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.6, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 3);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();
    source.stop(this.audioCtx.currentTime + 3);
  }

  destroy() {
    this.stopMusic();
    this.stopAmbient();
    this.stopRain();
    this.audioCtx?.close();
  }
}

export const audioManager = new AudioManager();
