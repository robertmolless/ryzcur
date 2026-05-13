import type { TimeOfDay, Weather } from '../../store/gameStore';

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private currentMood: string = '';

  async init() {
    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.15;
      this.masterGain.connect(this.ctx.destination);

      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.value = 0.3;
      this.ambienceGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.4;
      this.musicGain.connect(this.masterGain);
    } catch {
      console.log('Audio not available');
    }
  }

  async resume() {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  updateMood(timeOfDay: TimeOfDay, weather: Weather, location: string) {
    const mood = `${timeOfDay}-${weather}-${location}`;
    if (mood === this.currentMood) return;
    this.currentMood = mood;

    this.stopAll();
    if (!this.ctx || !this.musicGain) return;

    if (timeOfDay === 'night') {
      this.playNightAmbience();
    } else if (timeOfDay === 'evening') {
      this.playEveningAmbience();
    } else if (timeOfDay === 'morning') {
      this.playMorningAmbience();
    } else {
      this.playDayAmbience();
    }

    if (weather === 'rain' || weather === 'storm') {
      this.playRainSound(weather === 'storm');
    }
  }

  private playNote(freq: number, duration: number, delay: number, gain: number, type: OscillatorType = 'sine') {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    g.gain.setValueAtTime(0, this.ctx.currentTime + delay);
    g.gain.linearRampToValueAtTime(gain, this.ctx.currentTime + delay + 0.1);
    g.gain.linearRampToValueAtTime(gain * 0.6, this.ctx.currentTime + delay + duration * 0.7);
    g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + delay + duration);

    osc.connect(g);
    g.connect(this.musicGain);

    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);

    this.oscillators.push(osc);
  }

  private playNightAmbience() {
    const notes = [261.6, 293.7, 329.6, 392.0, 440.0];
    const playLoop = () => {
      if (this.currentMood.indexOf('night') === -1) return;
      for (let i = 0; i < 4; i++) {
        const note = notes[Math.floor(Math.random() * notes.length)];
        this.playNote(note * 0.5, 3 + Math.random() * 2, i * 1.5, 0.06, 'sine');
      }
      setTimeout(playLoop, 8000);
    };
    playLoop();
  }

  private playEveningAmbience() {
    const chords = [
      [261.6, 329.6, 392.0],
      [293.7, 349.2, 440.0],
      [329.6, 392.0, 493.9],
    ];
    const playLoop = () => {
      if (this.currentMood.indexOf('evening') === -1) return;
      const chord = chords[Math.floor(Math.random() * chords.length)];
      for (let i = 0; i < chord.length; i++) {
        this.playNote(chord[i] * 0.5, 4, i * 0.1, 0.04, 'triangle');
      }
      setTimeout(playLoop, 6000);
    };
    playLoop();
  }

  private playMorningAmbience() {
    const melody = [392.0, 440.0, 493.9, 523.3, 587.3];
    const playLoop = () => {
      if (this.currentMood.indexOf('morning') === -1) return;
      for (let i = 0; i < 3; i++) {
        const note = melody[Math.floor(Math.random() * melody.length)];
        this.playNote(note, 1.5, i * 0.8, 0.05, 'sine');
      }
      setTimeout(playLoop, 5000);
    };
    playLoop();
  }

  private playDayAmbience() {
    const notes = [523.3, 587.3, 659.3, 698.5, 784.0];
    const playLoop = () => {
      if (this.currentMood.indexOf('day') === -1) return;
      const note = notes[Math.floor(Math.random() * notes.length)];
      this.playNote(note * 0.25, 4, 0, 0.03, 'sine');
      setTimeout(playLoop, 7000);
    };
    playLoop();
  }

  private playRainSound(isStorm: boolean) {
    if (!this.ctx || !this.ambienceGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (isStorm ? 0.15 : 0.08);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = isStorm ? 2000 : 800;

    noise.connect(filter);
    filter.connect(this.ambienceGain);
    noise.start();
  }

  private stopAll() {
    for (const osc of this.oscillators) {
      try { osc.stop(); } catch { /* already stopped */ }
    }
    this.oscillators = [];
  }

  setVolume(vol: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = vol;
    }
  }

  destroy() {
    this.stopAll();
    this.ctx?.close();
  }
}

export const audioSystem = new AudioSystem();
