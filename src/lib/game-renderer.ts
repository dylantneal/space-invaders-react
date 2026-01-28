import { Player, Alien, Bullet, Shield } from '../types/game';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private time: number = 0;
  private backgroundGradient: CanvasGradient | null = null;
  private starSizes: number[] = [];

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = false;
    
    // Create background gradient matching the new slate theme
    this.backgroundGradient = this.ctx.createLinearGradient(0, 0, 0, this.ctx.canvas.height);
    this.backgroundGradient.addColorStop(0, '#020617');
    this.backgroundGradient.addColorStop(0.5, '#0f172a');
    this.backgroundGradient.addColorStop(1, '#020617');
  }

  clear() {
    if (this.backgroundGradient) {
      this.ctx.fillStyle = this.backgroundGradient;
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    this.time += 0.016;
  }

  drawPlayer(player: Player) {
    this.ctx.save();
    
    // Cyan gradient for player ship
    const gradient = this.ctx.createLinearGradient(
      player.x, player.y, 
      player.x, player.y + player.height
    );
    gradient.addColorStop(0, '#22d3ee');
    gradient.addColorStop(1, '#0891b2');
    
    this.ctx.fillStyle = gradient;
    this.ctx.shadowColor = '#22d3ee';
    this.ctx.shadowBlur = 15;
    
    // Main hull triangle
    this.ctx.beginPath();
    this.ctx.moveTo(player.x + player.width / 2, player.y);
    this.ctx.lineTo(player.x + 2, player.y + player.height - 3);
    this.ctx.lineTo(player.x + player.width - 2, player.y + player.height - 3);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Ship body
    this.ctx.shadowBlur = 8;
    this.ctx.fillRect(player.x + 4, player.y + 12, player.width - 8, player.height - 16);
    
    // Engine glow - orange accent
    this.ctx.shadowColor = '#fb923c';
    this.ctx.shadowBlur = 10;
    this.ctx.fillStyle = '#fb923c';
    this.ctx.fillRect(player.x + 8, player.y + player.height - 4, 4, 3);
    this.ctx.fillRect(player.x + player.width - 12, player.y + player.height - 4, 4, 3);
    
    this.ctx.restore();
  }

  drawAlien(alien: Alien) {
    this.ctx.save();
    
    // Updated colors to match theme
    const colors = {
      squid: { main: '#fb923c', shadow: '#ea580c', glow: '#fb923c' },    // Orange
      crab: { main: '#f472b6', shadow: '#db2777', glow: '#f472b6' },     // Pink
      octopus: { main: '#4ade80', shadow: '#16a34a', glow: '#4ade80' },  // Green
    };
    
    const colorSet = colors[alien.type];
    const drawY = alien.y;
    
    // Create gradient
    const gradient = this.ctx.createLinearGradient(
      alien.x, drawY,
      alien.x, drawY + alien.height
    );
    gradient.addColorStop(0, colorSet.main);
    gradient.addColorStop(1, colorSet.shadow);
    
    this.ctx.fillStyle = gradient;
    this.ctx.shadowColor = colorSet.glow;
    this.ctx.shadowBlur = 8;
    
    // Draw alien shapes
    switch (alien.type) {
      case 'squid':
        this.ctx.fillRect(alien.x + 3, drawY + 2, alien.width - 6, alien.height - 4);
        this.ctx.fillRect(alien.x + 1, drawY + 6, alien.width - 2, alien.height - 10);
        // Eyes
        this.ctx.fillStyle = '#fef3c7';
        this.ctx.shadowBlur = 0;
        this.ctx.fillRect(alien.x + 6, drawY + 5, 3, 3);
        this.ctx.fillRect(alien.x + alien.width - 9, drawY + 5, 3, 3);
        break;
      case 'crab':
        this.ctx.fillRect(alien.x + 2, drawY + 3, alien.width - 4, alien.height - 6);
        this.ctx.fillRect(alien.x, drawY + 8, alien.width, 4);
        // Claws
        this.ctx.fillRect(alien.x - 2, drawY + 6, 3, 5);
        this.ctx.fillRect(alien.x + alien.width - 1, drawY + 6, 3, 5);
        break;
      case 'octopus':
        this.ctx.fillRect(alien.x + 1, drawY + 1, alien.width - 2, alien.height - 6);
        // Tentacles with rounded look
        for (let i = 0; i < 4; i++) {
          const tentacleX = alien.x + 2 + i * 7;
          this.ctx.fillRect(tentacleX, drawY + alien.height - 6, 4, 5);
        }
        break;
    }
    
    this.ctx.restore();
  }

  drawBullet(bullet: Bullet) {
    this.ctx.save();
    
    if (bullet.fromPlayer) {
      // Cyan player bullets
      this.ctx.fillStyle = '#22d3ee';
      this.ctx.shadowColor = '#22d3ee';
      this.ctx.shadowBlur = 10;
      
      // Trail effect
      this.ctx.globalAlpha = 0.4;
      this.ctx.fillRect(bullet.x - 1, bullet.y + bullet.height, bullet.width + 2, 12);
      this.ctx.globalAlpha = 0.2;
      this.ctx.fillRect(bullet.x - 1, bullet.y + bullet.height + 8, bullet.width + 2, 8);
      this.ctx.globalAlpha = 1;
    } else {
      // Red/orange enemy bullets
      this.ctx.fillStyle = '#ef4444';
      this.ctx.shadowColor = '#ef4444';
      this.ctx.shadowBlur = 8;
    }
    
    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    this.ctx.restore();
  }

  drawAliens(aliens: Alien[]) {
    aliens.forEach(alien => this.drawAlien(alien));
  }

  drawBullets(bullets: Bullet[]) {
    bullets.forEach(bullet => this.drawBullet(bullet));
  }

  drawExplosion(x: number, y: number, frame: number) {
    this.ctx.save();
    
    const maxFrames = 10;
    const progress = frame / maxFrames;
    const size = 10 + progress * 30;
    
    // Multi-color explosion
    const colors = ['#fef3c7', '#fb923c', '#ef4444'];
    
    for (let layer = 0; layer < 3; layer++) {
      const layerSize = size - layer * 8;
      const layerAlpha = (1 - progress) * (1 - layer * 0.25);
      
      if (layerSize > 0 && layerAlpha > 0) {
        this.ctx.globalAlpha = Math.max(0, layerAlpha);
        this.ctx.fillStyle = colors[layer];
        this.ctx.shadowColor = colors[layer];
        this.ctx.shadowBlur = 15;
        
        this.ctx.beginPath();
        this.ctx.arc(x + 15, y + 10, layerSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    
    this.ctx.restore();
  }

  drawStars(stars: Array<{ x: number; y: number; brightness: number }>) {
    if (this.starSizes.length !== stars.length) {
      this.starSizes = stars.map(() => Math.random() > 0.85 ? 2 : 1);
    }
    
    this.ctx.save();
    
    stars.forEach((star, index) => {
      // Subtle blue-tinted stars
      const brightness = 0.3 + star.brightness * 0.5;
      this.ctx.fillStyle = `rgba(148, 163, 184, ${brightness})`;
      this.ctx.fillRect(star.x, star.y, this.starSizes[index], this.starSizes[index]);
    });
    
    this.ctx.restore();
  }
  drawShield(shield: Shield) {
    this.ctx.save();
    
    // Shield color - classic green
    this.ctx.fillStyle = '#4ade80';
    this.ctx.shadowColor = '#4ade80';
    this.ctx.shadowBlur = 4;
    
    // Draw each pixel that still exists
    for (let row = 0; row < shield.pixels.length; row++) {
      for (let col = 0; col < shield.pixels[row].length; col++) {
        if (shield.pixels[row][col]) {
          const pixelX = shield.x + col * shield.pixelSize;
          const pixelY = shield.y + row * shield.pixelSize;
          this.ctx.fillRect(pixelX, pixelY, shield.pixelSize - 1, shield.pixelSize - 1);
        }
      }
    }
    
    this.ctx.restore();
  }

  drawShields(shields: Shield[]) {
    shields.forEach(shield => this.drawShield(shield));
  }

}
