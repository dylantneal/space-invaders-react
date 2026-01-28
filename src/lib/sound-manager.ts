// Enhanced Sound Manager with optimizations and creative details

type SoundType = 
  | 'playerShoot'
  | 'alienShoot'
  | 'explosion'
  | 'explosionBig'
  | 'mysteryShipExplosion'
  | 'powerUp'
  | 'powerUpExpiring'
  | 'shieldHit'
  | 'playerDeath'
  | 'alienStep'
  | 'mysteryShip'
  | 'victory'
  | 'gameOver'
  | 'comboHit'
  | 'lowHealth';

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private mysteryShipOscillator: OscillatorNode | null = null;
  private mysteryShipLfo: OscillatorNode | null = null;
  private mysteryShipGain: GainNode | null = null;
  
  // Pre-computed noise buffers for performance
  private noiseBufferShort: AudioBuffer | null = null;
  private noiseBufferLong: AudioBuffer | null = null;
  
  // Alien heartbeat state - classic 4-note pattern
  private heartbeatInterval: number | null = null;
  private currentHeartbeatSpeed: number = 1000;
  private heartbeatNoteIndex: number = 0;
  private _alienAnimationFrame: number = 0;
  private readonly heartbeatNotes = [55, 49, 46, 41]; // Classic descending bass pattern
  
  // Combo tracking for multi-kill sounds
  private lastKillTime: number = 0;
  private comboCount: number = 0;
  
  // Low health warning
  private lowHealthInterval: number | null = null;
  
  // Reverb convolver for spacey feel
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  
  constructor() {
    // Audio context will be created on first user interaction
  }
  
  // Getter for alien animation frame (0 or 1) - synced with heartbeat
  get alienAnimationFrame(): number {
    return this._alienAnimationFrame;
  }
  
  private initAudioContext() {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.35;
      this.masterGain.connect(this.audioContext.destination);
      
      this.createNoiseBuffers();
      this.createReverb();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }
  
  private createNoiseBuffers() {
    if (!this.audioContext) return;
    
    const shortSize = this.audioContext.sampleRate * 0.2;
    this.noiseBufferShort = this.audioContext.createBuffer(1, shortSize, this.audioContext.sampleRate);
    const shortData = this.noiseBufferShort.getChannelData(0);
    for (let i = 0; i < shortSize; i++) {
      shortData[i] = Math.random() * 2 - 1;
    }
    
    const longSize = this.audioContext.sampleRate * 0.6;
    this.noiseBufferLong = this.audioContext.createBuffer(1, longSize, this.audioContext.sampleRate);
    const longData = this.noiseBufferLong.getChannelData(0);
    for (let i = 0; i < longSize; i++) {
      longData[i] = Math.random() * 2 - 1;
    }
  }
  
  private createReverb() {
    if (!this.audioContext || !this.masterGain) return;
    
    this.reverbGain = this.audioContext.createGain();
    this.reverbGain.gain.value = 0.15;
    
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * 1.5;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    
    this.reverbNode = this.audioContext.createConvolver();
    this.reverbNode.buffer = impulse;
    
    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.audioContext.destination);
  }
  
  private connectWithReverb(node: AudioNode, dryAmount: number = 0.8, wetAmount: number = 0.2) {
    if (!this.masterGain) return;
    
    const dryGain = this.audioContext!.createGain();
    dryGain.gain.value = dryAmount;
    node.connect(dryGain);
    dryGain.connect(this.masterGain);
    
    if (this.reverbNode && wetAmount > 0) {
      const wetGain = this.audioContext!.createGain();
      wetGain.gain.value = wetAmount;
      node.connect(wetGain);
      wetGain.connect(this.reverbNode);
    }
  }
  
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopHeartbeat();
      this.stopMysteryShipSound();
      this.stopLowHealthWarning();
    }
  }
  
  isEnabled(): boolean {
    return this.enabled;
  }
  
  setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
  
  registerKill() {
    const now = Date.now();
    if (now - this.lastKillTime < 500) {
      this.comboCount++;
      if (this.comboCount >= 3) {
        this.play('comboHit');
      }
    } else {
      this.comboCount = 1;
    }
    this.lastKillTime = now;
  }
  
  play(sound: SoundType) {
    if (!this.enabled) return;
    this.initAudioContext();
    if (!this.audioContext || !this.masterGain) return;
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    switch (sound) {
      case 'playerShoot': this.playPlayerShoot(); break;
      case 'alienShoot': this.playAlienShoot(); break;
      case 'explosion': this.playExplosion(false); break;
      case 'explosionBig': this.playExplosion(true); break;
      case 'mysteryShipExplosion': this.playMysteryShipExplosion(); break;
      case 'powerUp': this.playPowerUp(); break;
      case 'powerUpExpiring': this.playPowerUpExpiring(); break;
      case 'shieldHit': this.playShieldHit(); break;
      case 'playerDeath': this.playPlayerDeath(); break;
      case 'alienStep': this.playAlienStep(); break;
      case 'victory': this.playVictory(); break;
      case 'gameOver': this.playGameOver(); break;
      case 'comboHit': this.playComboHit(); break;
      case 'lowHealth': this.playLowHealthBeep(); break;
    }
  }
  
  private playPlayerShoot() {
    const ctx = this.audioContext!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    const pitchVariation = 0.95 + Math.random() * 0.1;
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(880 * pitchVariation, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    this.connectWithReverb(gain, 0.9, 0.1);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }
  
  private playAlienShoot() {
    const ctx = this.audioContext!;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();
    
    lfo.type = 'sine';
    lfo.frequency.value = 30;
    lfoGain.gain.value = 20;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    
    osc.connect(gain);
    this.connectWithReverb(gain, 0.85, 0.15);
    
    lfo.start(ctx.currentTime);
    osc.start(ctx.currentTime);
    lfo.stop(ctx.currentTime + 0.12);
    osc.stop(ctx.currentTime + 0.12);
  }
  
  private playExplosion(big: boolean) {
    const ctx = this.audioContext!;
    const buffer = big ? this.noiseBufferLong : this.noiseBufferShort;
    if (!buffer) return;
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const startFreq = big ? 1500 : 1000 + Math.random() * 500;
    const endFreq = big ? 60 : 80 + Math.random() * 40;
    const duration = big ? 0.4 : 0.15 + Math.random() * 0.05;
    
    filter.frequency.setValueAtTime(startFreq, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(big ? 0.45 : 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    this.connectWithReverb(gain, 0.7, 0.3);
    
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + duration);
    
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(big ? 80 : 60, ctx.currentTime);
    thump.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.1);
    thumpGain.gain.setValueAtTime(big ? 0.4 : 0.25, ctx.currentTime);
    thumpGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    thump.connect(thumpGain);
    thumpGain.connect(this.masterGain!);
    thump.start(ctx.currentTime);
    thump.stop(ctx.currentTime + 0.1);
  }
  
  private playMysteryShipExplosion() {
    const ctx = this.audioContext!;
    
    this.stopMysteryShipSound();
    
    if (this.noiseBufferLong) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBufferLong;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
      filter.Q.value = 2;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      noise.connect(filter);
      filter.connect(gain);
      this.connectWithReverb(gain, 0.6, 0.4);
      
      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + 0.5);
    }
    
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
    
    oscGain.gain.setValueAtTime(0.35, ctx.currentTime);
    oscGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.1);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.connect(oscGain);
    this.connectWithReverb(oscGain, 0.6, 0.4);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    
    for (let i = 0; i < 5; i++) {
      const sparkle = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      const startTime = ctx.currentTime + 0.05 + i * 0.06;
      
      sparkle.type = 'sine';
      sparkle.frequency.value = 2000 + Math.random() * 3000;
      
      sparkleGain.gain.setValueAtTime(0, startTime);
      sparkleGain.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
      sparkleGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);
      
      sparkle.connect(sparkleGain);
      sparkleGain.connect(this.masterGain!);
      
      sparkle.start(startTime);
      sparkle.stop(startTime + 0.08);
    }
  }
  
  private playPowerUp() {
    const ctx = this.audioContext!;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc2.type = 'sine';
      osc2.frequency.value = freq * 1.005;
      
      const startTime = ctx.currentTime + i * 0.06;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      
      osc.connect(gain);
      osc2.connect(gain);
      this.connectWithReverb(gain, 0.6, 0.4);
      
      osc.start(startTime);
      osc2.start(startTime);
      osc.stop(startTime + 0.2);
      osc2.stop(startTime + 0.2);
    });
  }
  
  private playPowerUpExpiring() {
    const ctx = this.audioContext!;
    
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + i * 0.12;
      
      osc.type = 'square';
      osc.frequency.value = 880;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.08);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start(startTime);
      osc.stop(startTime + 0.08);
    }
  }
  
  private playShieldHit() {
    const ctx = this.audioContext!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }
  
  private playPlayerDeath() {
    const ctx = this.audioContext!;
    
    const osc = ctx.createOscillator();
    const distortion = ctx.createWaveShaper();
    const gain = ctx.createGain();
    
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = Math.tanh(x * 2);
    }
    distortion.curve = curve;
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.7);
    
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
    
    osc.connect(distortion);
    distortion.connect(gain);
    this.connectWithReverb(gain, 0.5, 0.5);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.7);
    
    if (this.noiseBufferLong) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBufferLong;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      
      noise.connect(noiseGain);
      noiseGain.connect(this.masterGain!);
      
      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + 0.6);
    }
  }
  
  private playAlienStep() {
    const ctx = this.audioContext!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    const note = this.heartbeatNotes[this.heartbeatNoteIndex];
    this.heartbeatNoteIndex = (this.heartbeatNoteIndex + 1) % this.heartbeatNotes.length;
    
    // Toggle animation frame (0 or 1) with each beat
    this._alienAnimationFrame = 1 - this._alienAnimationFrame;
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(note, ctx.currentTime);
    osc.frequency.setValueAtTime(note * 0.9, ctx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }
  
  private playComboHit() {
    const ctx = this.audioContext!;
    
    const notes = [880, 1108.73, 1318.51];
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + i * 0.04;
      
      osc.type = 'square';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
      
      osc.connect(gain);
      this.connectWithReverb(gain, 0.7, 0.3);
      
      osc.start(startTime);
      osc.stop(startTime + 0.1);
    });
  }
  
  private playLowHealthBeep() {
    const ctx = this.audioContext!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 220;
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }
  
  startLowHealthWarning() {
    if (!this.enabled || this.lowHealthInterval) return;
    this.initAudioContext();
    
    this.lowHealthInterval = window.setInterval(() => {
      this.play('lowHealth');
    }, 800);
  }
  
  stopLowHealthWarning() {
    if (this.lowHealthInterval) {
      clearInterval(this.lowHealthInterval);
      this.lowHealthInterval = null;
    }
  }
  
  startHeartbeat(speedMultiplier: number = 1) {
    if (!this.enabled) return;
    this.initAudioContext();
    
    const interval = Math.max(120, 900 / speedMultiplier);
    
    if (Math.abs(interval - this.currentHeartbeatSpeed) < 40 && this.heartbeatInterval) {
      return;
    }
    
    this.currentHeartbeatSpeed = interval;
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = window.setInterval(() => {
      this.play('alienStep');
    }, interval);
  }
  
  updateHeartbeatSpeed(speedMultiplier: number) {
    if (!this.heartbeatInterval) return;
    this.startHeartbeat(speedMultiplier);
  }
  
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.heartbeatNoteIndex = 0;
    this._alienAnimationFrame = 0;
  }
  
  startMysteryShipSound() {
    if (!this.enabled) return;
    this.initAudioContext();
    if (!this.audioContext || !this.masterGain) return;
    
    this.stopMysteryShipSound();
    
    this.mysteryShipOscillator = this.audioContext.createOscillator();
    this.mysteryShipGain = this.audioContext.createGain();
    
    this.mysteryShipLfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    
    this.mysteryShipLfo.type = 'sine';
    this.mysteryShipLfo.frequency.value = 6;
    lfoGain.gain.value = 40;
    
    this.mysteryShipLfo.connect(lfoGain);
    lfoGain.connect(this.mysteryShipOscillator.frequency);
    
    const lfo2 = this.audioContext.createOscillator();
    const lfo2Gain = this.audioContext.createGain();
    
    lfo2.type = 'sine';
    lfo2.frequency.value = 4;
    lfo2Gain.gain.value = 0.05;
    
    lfo2.connect(lfo2Gain);
    lfo2Gain.connect(this.mysteryShipGain.gain);
    
    this.mysteryShipOscillator.type = 'sine';
    this.mysteryShipOscillator.frequency.value = 380;
    
    this.mysteryShipGain.gain.value = 0.12;
    
    this.mysteryShipOscillator.connect(this.mysteryShipGain);
    this.mysteryShipGain.connect(this.masterGain);
    
    this.mysteryShipLfo.start();
    lfo2.start();
    this.mysteryShipOscillator.start();
  }
  
  stopMysteryShipSound() {
    if (this.mysteryShipOscillator) {
      try { this.mysteryShipOscillator.stop(); } catch (e) {}
      this.mysteryShipOscillator = null;
    }
    if (this.mysteryShipLfo) {
      try { this.mysteryShipLfo.stop(); } catch (e) {}
      this.mysteryShipLfo = null;
    }
    if (this.mysteryShipGain) {
      this.mysteryShipGain = null;
    }
  }
  
  private playVictory() {
    const ctx = this.audioContext!;
    
    const melody = [
      { freq: 523.25, time: 0, duration: 0.12 },
      { freq: 659.25, time: 0.12, duration: 0.12 },
      { freq: 783.99, time: 0.24, duration: 0.12 },
      { freq: 1046.50, time: 0.36, duration: 0.25 },
      { freq: 783.99, time: 0.61, duration: 0.08 },
      { freq: 1046.50, time: 0.69, duration: 0.45 },
    ];
    
    const harmony = [
      { freq: 659.25, time: 0.36, duration: 0.25 },
      { freq: 523.25, time: 0.61, duration: 0.08 },
      { freq: 659.25, time: 0.69, duration: 0.45 },
    ];
    
    const playNote = (note: { freq: number; time: number; duration: number }, volume: number = 0.2) => {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.value = note.freq;
      osc2.type = 'square';
      osc2.frequency.value = note.freq * 2;
      
      const startTime = ctx.currentTime + note.time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
      gain.gain.setValueAtTime(volume, startTime + note.duration - 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
      
      osc.connect(gain);
      const gain2 = ctx.createGain();
      gain2.gain.value = 0.3;
      osc2.connect(gain2);
      gain2.connect(gain);
      
      this.connectWithReverb(gain, 0.6, 0.4);
      
      osc.start(startTime);
      osc2.start(startTime);
      osc.stop(startTime + note.duration);
      osc2.stop(startTime + note.duration);
    };
    
    melody.forEach(note => playNote(note, 0.22));
    harmony.forEach(note => playNote(note, 0.12));
  }
  
  private playGameOver() {
    const ctx = this.audioContext!;
    
    const melody = [
      { freq: 392.00, time: 0, duration: 0.35 },
      { freq: 349.23, time: 0.35, duration: 0.35 },
      { freq: 311.13, time: 0.70, duration: 0.35 },
      { freq: 293.66, time: 1.05, duration: 0.35 },
      { freq: 261.63, time: 1.40, duration: 0.7 },
    ];
    
    melody.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = note.freq;
      
      const startTime = ctx.currentTime + note.time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.28, startTime + 0.025);
      gain.gain.setValueAtTime(0.28, startTime + note.duration - 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
      
      osc.connect(gain);
      this.connectWithReverb(gain, 0.5, 0.5);
      
      osc.start(startTime);
      osc.stop(startTime + note.duration);
    });
  }
  
  dispose() {
    this.stopHeartbeat();
    this.stopMysteryShipSound();
    this.stopLowHealthWarning();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const soundManager = new SoundManager();
