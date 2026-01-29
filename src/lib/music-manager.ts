// Music Manager for background music during gameplay

// The 4 gameplay tracks that will be shuffled each game
const GAMEPLAY_TRACKS = [
  '/music/track1.mp3', // PrimordialTerror
  '/music/track2.mp3', // InTheStareOfInfinity
  '/music/track3.mp3', // ThisInsurmountableEvilThatHangsAboveUsAll
  '/music/track4.mp3', // TendrilsOfDescendingDivinity
];

class MusicManager {
  private currentTrackIndex: number = -1; // Index in the shuffled playlist (0-3)
  private audioElement: HTMLAudioElement | null = null;
  private enabled: boolean = true;
  private masterVolume: number = 1.0;
  private fadeInterval: number | null = null;
  private shuffledPlaylist: string[] = []; // Shuffled order of track URLs
  private preloadedAudio: Map<string, HTMLAudioElement> = new Map();
  private readonly trackVolume: number = 0.4; // Volume for gameplay tracks

  constructor() {
    // Preload all tracks
    this.preloadAllTracks();
  }

  private preloadAllTracks(): void {
    GAMEPLAY_TRACKS.forEach(src => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.loop = true; // Songs loop when they finish
      audio.volume = 0;
      
      audio.addEventListener('error', () => {
        console.warn(`Music track not found at ${src}`);
      });

      audio.addEventListener('canplaythrough', () => {
        this.preloadedAudio.set(src, audio);
      }, { once: true });

      audio.src = src;
    });
  }

  /**
   * Shuffle the playlist order. Call this when starting a new game.
   */
  initializePlaylist(): void {
    // Fisher-Yates shuffle
    this.shuffledPlaylist = [...GAMEPLAY_TRACKS];
    for (let i = this.shuffledPlaylist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledPlaylist[i], this.shuffledPlaylist[j]] = 
        [this.shuffledPlaylist[j], this.shuffledPlaylist[i]];
    }
    
    // Reset state for new game
    this.currentTrackIndex = -1;
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }
  }

  /**
   * Get which music slot (0-3) a wave belongs to.
   * Waves 1-3 → slot 0, waves 4-6 → slot 1, waves 7-9 → slot 2, waves 10-12 → slot 3
   */
  private getMusicSlotForWave(wave: number): number {
    return Math.floor((wave - 1) / 3);
  }

  /**
   * Play the appropriate track for the given wave.
   * Only changes track if we're in a new music slot.
   * If already playing the correct track, it continues from current position.
   */
  playForWave(wave: number, fadeIn: boolean = true): void {
    if (!this.enabled) return;
    
    const slot = this.getMusicSlotForWave(wave);
    
    // Clamp slot to valid range (0-3) in case wave > 12
    const clampedSlot = Math.min(slot, 3);
    
    // If we're already playing the correct track, don't restart it
    if (this.currentTrackIndex === clampedSlot && this.audioElement && !this.audioElement.paused) {
      return;
    }
    
    // If same slot but audio is paused (e.g., after resume), just resume
    if (this.currentTrackIndex === clampedSlot && this.audioElement && this.audioElement.paused) {
      this.resume();
      return;
    }
    
    // Need to switch to a different track
    this.switchToTrack(clampedSlot, fadeIn);
  }

  private switchToTrack(slotIndex: number, fadeIn: boolean): void {
    if (this.shuffledPlaylist.length === 0) {
      console.warn('Playlist not initialized. Call initializePlaylist() first.');
      return;
    }

    const trackSrc = this.shuffledPlaylist[slotIndex];
    
    // Fade out current track if playing
    if (this.audioElement && !this.audioElement.paused) {
      this.fadeOut(() => {
        this.startTrack(trackSrc, slotIndex, fadeIn);
      });
    } else {
      this.startTrack(trackSrc, slotIndex, fadeIn);
    }
  }

  private startTrack(src: string, slotIndex: number, fadeIn: boolean): void {
    // Try to use preloaded audio, or create new
    let audio = this.preloadedAudio.get(src);
    
    if (!audio) {
      audio = new Audio(src);
      audio.loop = true;
    }

    // Reset to beginning when switching to a new track
    audio.currentTime = 0;
    
    this.audioElement = audio;
    this.currentTrackIndex = slotIndex;
    
    const targetVolume = this.trackVolume * this.masterVolume;
    
    if (fadeIn) {
      this.audioElement.volume = 0;
      this.audioElement.play().catch(e => {
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

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.trackVolume * this.masterVolume;
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
      // Don't reset currentTime here - we preserve position for potential resume
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
        this.fadeOut(() => {
          if (this.audioElement) {
            this.audioElement.currentTime = 0;
          }
        });
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
    if (this.enabled && this.audioElement && this.audioElement.paused) {
      const targetVolume = this.trackVolume * this.masterVolume;
      this.audioElement.volume = targetVolume;
      this.audioElement.play().catch(e => {
        console.warn('Music resume blocked:', e);
      });
    }
  }

  isPlaying(): boolean {
    return this.audioElement !== null && !this.audioElement.paused;
  }

  getCurrentTrackIndex(): number {
    return this.currentTrackIndex;
  }

  /**
   * Play a random track for the menu screen.
   * Uses a special index (-1) to indicate menu music.
   */
  playMenuMusic(): void {
    if (!this.enabled) return;
    
    // If already playing menu music, don't restart
    if (this.currentTrackIndex === -1 && this.audioElement && !this.audioElement.paused) {
      return;
    }
    
    // Pick a random track
    const randomIndex = Math.floor(Math.random() * GAMEPLAY_TRACKS.length);
    const trackSrc = GAMEPLAY_TRACKS[randomIndex];
    
    // Fade out current track if playing
    if (this.audioElement && !this.audioElement.paused) {
      this.fadeOut(() => {
        this.startMenuTrack(trackSrc);
      });
    } else {
      this.startMenuTrack(trackSrc);
    }
  }

  private startMenuTrack(src: string): void {
    // Try to use preloaded audio, or create new
    let audio = this.preloadedAudio.get(src);
    
    if (!audio) {
      audio = new Audio(src);
      audio.loop = true;
    }

    // Start from beginning for menu
    audio.currentTime = 0;
    
    this.audioElement = audio;
    this.currentTrackIndex = -1; // Special index for menu music
    
    const targetVolume = this.trackVolume * this.masterVolume;
    
    // Fade in
    this.audioElement.volume = 0;
    this.audioElement.play().catch(e => {
      console.warn('Music autoplay blocked:', e);
    });
    this.fadeToVolume(targetVolume, 1000);
  }
}

// Export singleton instance
export const musicManager = new MusicManager();
