// Music Manager for background music during gameplay

export type MusicTrack = 'gameplay' | 'boss' | 'menu' | 'victory' | 'gameOver';

interface TrackConfig {
  src: string;
  volume: number;
  loop: boolean;
}

const TRACKS: Record<MusicTrack, TrackConfig> = {
  gameplay: {
    src: '/music/gameplay.mp3',
    volume: 0.4,
    loop: true,
  },
  boss: {
    src: '/music/boss.mp3', // Placeholder - add boss music later
    volume: 0.5,
    loop: true,
  },
  menu: {
    src: '/music/menu.mp3', // Placeholder - add menu music later
    volume: 0.3,
    loop: true,
  },
  victory: {
    src: '/music/victory.mp3', // Placeholder
    volume: 0.5,
    loop: false,
  },
  gameOver: {
    src: '/music/gameover.mp3', // Placeholder
    volume: 0.5,
    loop: false,
  },
};

class MusicManager {
  private currentTrack: MusicTrack | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private enabled: boolean = true;
  private masterVolume: number = 1.0;
  private fadeInterval: number | null = null;
  private loadedTracks: Map<MusicTrack, HTMLAudioElement> = new Map();

  constructor() {
    // Preload the gameplay track
    this.preloadTrack('gameplay');
  }

  private preloadTrack(track: MusicTrack): HTMLAudioElement | null {
    if (this.loadedTracks.has(track)) {
      return this.loadedTracks.get(track)!;
    }

    const config = TRACKS[track];
    const audio = new Audio();
    
    // Check if the file exists before setting src
    audio.preload = 'auto';
    audio.loop = config.loop;
    audio.volume = 0;
    
    audio.addEventListener('error', () => {
      console.warn(`Music track "${track}" not found at ${config.src}`);
    });

    audio.addEventListener('canplaythrough', () => {
      this.loadedTracks.set(track, audio);
    }, { once: true });

    audio.src = config.src;
    
    return audio;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    } else if (this.currentTrack) {
      // Resume if we had a track playing
      this.play(this.currentTrack);
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      const config = this.currentTrack ? TRACKS[this.currentTrack] : null;
      if (config) {
        this.audioElement.volume = config.volume * this.masterVolume;
      }
    }
  }

  play(track: MusicTrack, fadeIn: boolean = true): void {
    if (!this.enabled) {
      this.currentTrack = track; // Remember for when re-enabled
      return;
    }

    const config = TRACKS[track];
    
    // If same track is already playing, don't restart
    if (this.currentTrack === track && this.audioElement && !this.audioElement.paused) {
      return;
    }

    // Stop current track with fade out
    if (this.audioElement && !this.audioElement.paused) {
      this.fadeOut(() => {
        this.startTrack(track, config, fadeIn);
      });
    } else {
      this.startTrack(track, config, fadeIn);
    }
  }

  private startTrack(track: MusicTrack, config: TrackConfig, fadeIn: boolean): void {
    // Try to use preloaded track or create new one
    let audio = this.loadedTracks.get(track);
    
    if (!audio) {
      audio = new Audio(config.src);
      audio.loop = config.loop;
    }

    this.audioElement = audio;
    this.currentTrack = track;
    
    const targetVolume = config.volume * this.masterVolume;
    
    if (fadeIn) {
      this.audioElement.volume = 0;
      this.audioElement.play().catch(e => {
        // Auto-play might be blocked - that's okay, will play on user interaction
        console.warn('Music autoplay blocked:', e);
      });
      this.fadeToVolume(targetVolume, 1000);
    } else {
      this.audioElement.volume = targetVolume;
      this.audioElement.play().catch(e => {
        console.warn('Music autoplay blocked:', e);
      });
    }
  }

  private fadeToVolume(targetVolume: number, duration: number): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }

    if (!this.audioElement) return;

    const startVolume = this.audioElement.volume;
    const volumeDiff = targetVolume - startVolume;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = volumeDiff / steps;
    let currentStep = 0;

    this.fadeInterval = window.setInterval(() => {
      currentStep++;
      if (this.audioElement) {
        this.audioElement.volume = Math.max(0, Math.min(1, startVolume + volumeStep * currentStep));
      }
      
      if (currentStep >= steps) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
      }
    }, stepTime);
  }

  private fadeOut(callback?: () => void): void {
    if (!this.audioElement) {
      callback?.();
      return;
    }

    const audio = this.audioElement;
    this.fadeToVolume(0, 500);
    
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      callback?.();
    }, 550);
  }

  stop(fadeOut: boolean = true): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    if (this.audioElement) {
      if (fadeOut) {
        this.fadeOut();
      } else {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      }
    }
  }

  pause(): void {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
  }

  resume(): void {
    if (this.enabled && this.audioElement && this.audioElement.paused && this.currentTrack) {
      this.audioElement.play().catch(e => {
        console.warn('Music resume blocked:', e);
      });
    }
  }

  // Switch to boss music (with crossfade)
  playBossMusic(): void {
    // Only play boss music if the file exists, otherwise keep gameplay music
    if (this.loadedTracks.has('boss')) {
      this.play('boss');
    }
    // If boss music doesn't exist, we could increase the intensity of gameplay music
    // For now, just keep playing gameplay music
  }

  // Switch back to gameplay music
  playGameplayMusic(): void {
    this.play('gameplay');
  }

  isPlaying(): boolean {
    return this.audioElement !== null && !this.audioElement.paused;
  }

  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }
}

// Export singleton instance
export const musicManager = new MusicManager();
