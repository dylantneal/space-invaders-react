import { Player, Alien, Bullet } from '../types/game';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private time: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = context;
    // Enable smoother rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  clear() {
    // Enhanced background with subtle gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.ctx.canvas.height);
    gradient.addColorStop(0, 'oklch(0.05 0.02 240)');
    gradient.addColorStop(0.5, 'oklch(0.08 0.02 220)');
    gradient.addColorStop(1, 'oklch(0.04 0.01 200)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
    this.time += 0.016; // ~60fps
  }

  drawPlayer(player: Player) {
    this.ctx.save();
    
    // Main ship color with glow effect
    const gradient = this.ctx.createLinearGradient(
      player.x, player.y, 
      player.x, player.y + player.height
    );
    gradient.addColorStop(0, 'oklch(0.85 0.25 190)');
    gradient.addColorStop(1, 'oklch(0.65 0.2 180)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.shadowColor = 'oklch(0.75 0.25 190)';
    this.ctx.shadowBlur = 8;
    
    // Enhanced ship design
    this.ctx.beginPath();
    // Main hull
    this.ctx.moveTo(player.x + player.width / 2, player.y);
    this.ctx.lineTo(player.x + 2, player.y + player.height - 3);
    this.ctx.lineTo(player.x + player.width - 2, player.y + player.height - 3);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Ship body with detail
    this.ctx.shadowBlur = 4;
    this.ctx.fillRect(player.x + 4, player.y + 12, player.width - 8, player.height - 16);
    
    // Engine glow effect
    this.ctx.shadowColor = 'oklch(0.82 0.18 60)';
    this.ctx.shadowBlur = 6;
    this.ctx.fillStyle = 'oklch(0.82 0.18 60)';
    this.ctx.fillRect(player.x + 8, player.y + player.height - 4, 4, 2);
    this.ctx.fillRect(player.x + player.width - 12, player.y + player.height - 4, 4, 2);
    
    this.ctx.restore();
  }

  drawAlien(alien: Alien) {
    this.ctx.save();
    
    const colors = {
      squid: { main: 'oklch(0.85 0.18 60)', shadow: 'oklch(0.65 0.15 50)' },
      crab: { main: 'oklch(0.68 0.22 15)', shadow: 'oklch(0.48 0.18 10)' }, 
      octopus: { main: 'oklch(0.68 0.22 150)', shadow: 'oklch(0.48 0.18 140)' },
    };
    
    const colorSet = colors[alien.type];
    
    // Animate aliens with slight bobbing
    const bobOffset = Math.sin(this.time * 2 + alien.x * 0.01) * 1;
    const adjustedY = alien.y + bobOffset;
    
    // Create gradient for depth
    const gradient = this.ctx.createLinearGradient(
      alien.x, adjustedY,
      alien.x, adjustedY + alien.height
    );
    gradient.addColorStop(0, colorSet.main);
    gradient.addColorStop(1, colorSet.shadow);
    
    this.ctx.fillStyle = gradient;
    this.ctx.shadowColor = colorSet.main;
    this.ctx.shadowBlur = 4;
    
    // Enhanced alien shapes with more detail
    switch (alien.type) {
      case 'squid':
        // Top invader - more detailed angular design
        this.ctx.fillRect(alien.x + 3, adjustedY + 2, alien.width - 6, alien.height - 4);
        this.ctx.fillRect(alien.x + 1, adjustedY + 6, alien.width - 2, alien.height - 10);
        // Eyes
        this.ctx.fillStyle = 'oklch(0.9 0.1 190)';
        this.ctx.fillRect(alien.x + 4, adjustedY + 4, 2, 2);
        this.ctx.fillRect(alien.x + alien.width - 6, adjustedY + 4, 2, 2);
        break;
      case 'crab':
        // Middle invader - crab-like with claws
        this.ctx.fillRect(alien.x + 2, adjustedY + 3, alien.width - 4, alien.height - 6);
        this.ctx.fillRect(alien.x, adjustedY + 8, alien.width, 3);
        // Claws
        this.ctx.fillRect(alien.x - 1, adjustedY + 6, 2, 4);
        this.ctx.fillRect(alien.x + alien.width - 1, adjustedY + 6, 2, 4);
        break;
      case 'octopus':
        // Bottom invader - octopus with tentacles
        this.ctx.fillRect(alien.x + 1, adjustedY + 1, alien.width - 2, alien.height - 6);
        // Tentacles
        for (let i = 0; i < 4; i++) {
          const tentacleX = alien.x + 2 + i * 4;
          this.ctx.fillRect(tentacleX, adjustedY + alien.height - 5, 2, 4);
        }
        break;
    }
    
    this.ctx.restore();
  }

  drawBullet(bullet: Bullet) {
    this.ctx.save();
    
    if (bullet.fromPlayer) {
      // Player bullets - bright with trail effect
      this.ctx.fillStyle = 'oklch(0.95 0.1 180)';
      this.ctx.shadowColor = 'oklch(0.95 0.1 180)';
      this.ctx.shadowBlur = 6;
      
      // Draw trail
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillRect(bullet.x - 1, bullet.y + bullet.height, bullet.width + 2, 8);
      this.ctx.globalAlpha = 1;
    } else {
      // Alien bullets - menacing red with glow
      this.ctx.fillStyle = 'oklch(0.68 0.22 15)';
      this.ctx.shadowColor = 'oklch(0.68 0.22 15)';
      this.ctx.shadowBlur = 4;
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
    const size = 8 + progress * 24;
    
    // Multi-layered explosion effect
    const colors = [
      `oklch(0.95 0.1 180)`, // White core
      `oklch(0.85 0.18 60)`, // Yellow
      `oklch(0.68 0.22 15)`, // Orange/Red
    ];
    
    // Draw explosion layers
    for (let layer = 0; layer < 3; layer++) {
      const layerSize = size - layer * 6;
      const layerAlpha = 1 - progress - layer * 0.2;
      
      if (layerSize > 0 && layerAlpha > 0) {
        this.ctx.globalAlpha = Math.max(0, layerAlpha);
        this.ctx.fillStyle = colors[layer];
        this.ctx.shadowColor = colors[layer];
        this.ctx.shadowBlur = 8;
        
        // Create jagged explosion shape
        this.ctx.beginPath();
        const points = 8;
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const radius = layerSize * (0.7 + Math.random() * 0.3);
          const px = x + Math.cos(angle) * radius;
          const py = y + Math.sin(angle) * radius;
          
          if (i === 0) {
            this.ctx.moveTo(px, py);
          } else {
            this.ctx.lineTo(px, py);
          }
        }
        this.ctx.closePath();
        this.ctx.fill();
      }
    }
    
    this.ctx.restore();
  }

  drawStars(stars: Array<{ x: number; y: number; brightness: number }>) {
    this.ctx.save();
    
    stars.forEach((star, index) => {
      // Twinkling effect
      const twinkle = Math.sin(this.time * 2 + index * 0.5) * 0.3 + 0.7;
      const brightness = star.brightness * twinkle;
      
      this.ctx.fillStyle = `oklch(${brightness} 0.05 200)`;
      this.ctx.shadowColor = `oklch(${brightness} 0.05 200)`;
      this.ctx.shadowBlur = 2;
      
      // Vary star sizes slightly
      const size = Math.random() > 0.9 ? 2 : 1;
      this.ctx.fillRect(star.x, star.y, size, size);
    });
    
    this.ctx.restore();
  }
}