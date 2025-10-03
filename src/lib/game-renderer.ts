import { Player, Alien, Bullet } from '../types/game';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = context;
  }

  clear() {
    this.ctx.fillStyle = 'oklch(0.1 0 0)';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  drawPlayer(player: Player) {
    this.ctx.fillStyle = 'oklch(0.7 0.3 240)';
    
    // Simple ship shape
    this.ctx.beginPath();
    this.ctx.moveTo(player.x + player.width / 2, player.y);
    this.ctx.lineTo(player.x, player.y + player.height);
    this.ctx.lineTo(player.x + player.width, player.y + player.height);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Ship body
    this.ctx.fillRect(player.x + 5, player.y + 10, player.width - 10, player.height - 15);
  }

  drawAlien(alien: Alien) {
    const colors = {
      squid: 'oklch(0.85 0.15 60)',
      crab: 'oklch(0.6 0.25 0)', 
      octopus: 'oklch(0.65 0.25 120)',
    };
    
    this.ctx.fillStyle = colors[alien.type];
    
    // Simple alien shape based on type
    switch (alien.type) {
      case 'squid':
        // Top invader - more angular
        this.ctx.fillRect(alien.x + 5, alien.y, alien.width - 10, alien.height);
        this.ctx.fillRect(alien.x, alien.y + 5, alien.width, alien.height - 10);
        break;
      case 'crab':
        // Middle invader - rounded
        this.ctx.fillRect(alien.x + 2, alien.y + 2, alien.width - 4, alien.height - 4);
        this.ctx.fillRect(alien.x, alien.y + 8, alien.width, 4);
        break;
      case 'octopus':
        // Bottom invader - simple rectangle
        this.ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
        break;
    }
  }

  drawBullet(bullet: Bullet) {
    this.ctx.fillStyle = bullet.fromPlayer ? 'oklch(0.95 0 0)' : 'oklch(0.6 0.25 0)';
    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }

  drawAliens(aliens: Alien[]) {
    aliens.forEach(alien => this.drawAlien(alien));
  }

  drawBullets(bullets: Bullet[]) {
    bullets.forEach(bullet => this.drawBullet(bullet));
  }

  drawExplosion(x: number, y: number, frame: number) {
    const colors = ['oklch(0.95 0 0)', 'oklch(0.85 0.15 60)', 'oklch(0.6 0.25 0)'];
    const size = 20 + frame * 5;
    
    this.ctx.fillStyle = colors[frame % colors.length];
    this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }

  drawStars(stars: Array<{ x: number; y: number; brightness: number }>) {
    stars.forEach(star => {
      this.ctx.fillStyle = `oklch(${star.brightness} 0 0)`;
      this.ctx.fillRect(star.x, star.y, 1, 1);
    });
  }
}