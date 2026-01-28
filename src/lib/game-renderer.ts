import { Player, Alien, Bullet, Shield, MysteryShip, PowerUp, ActivePowerUps, Boss, POWERUP_COLORS, BOSS_COLORS, GAME_CONFIG } from '../types/game';

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

  drawPlayer(player: Player, hasShield: boolean = false) {
    this.ctx.save();
    
    if (hasShield) {
      const pulse = Math.sin(this.time * 6) * 0.2 + 0.8;
      this.ctx.strokeStyle = '#06b6d4';
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = '#22d3ee';
      this.ctx.shadowBlur = 15 * pulse;
      this.ctx.globalAlpha = 0.6 + pulse * 0.2;
      
      this.ctx.beginPath();
      this.ctx.ellipse(
        player.x + player.width / 2,
        player.y + player.height / 2,
        player.width / 2 + 8,
        player.height / 2 + 8,
        0, 0, Math.PI * 2
      );
      this.ctx.stroke();
      
      this.ctx.globalAlpha = 0.2;
      this.ctx.fillStyle = '#06b6d4';
      this.ctx.fill();
      
      this.ctx.globalAlpha = 1;
    }
    
    const gradient = this.ctx.createLinearGradient(
      player.x, player.y, 
      player.x, player.y + player.height
    );
    gradient.addColorStop(0, '#22d3ee');
    gradient.addColorStop(1, '#0891b2');
    
    this.ctx.fillStyle = gradient;
    this.ctx.shadowColor = '#22d3ee';
    this.ctx.shadowBlur = 15;
    
    this.ctx.beginPath();
    this.ctx.moveTo(player.x + player.width / 2, player.y);
    this.ctx.lineTo(player.x + 2, player.y + player.height - 3);
    this.ctx.lineTo(player.x + player.width - 2, player.y + player.height - 3);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.shadowBlur = 8;
    this.ctx.fillRect(player.x + 4, player.y + 12, player.width - 8, player.height - 16);
    
    this.ctx.shadowColor = '#fb923c';
    this.ctx.shadowBlur = 10;
    this.ctx.fillStyle = '#fb923c';
    this.ctx.fillRect(player.x + 8, player.y + player.height - 4, 4, 3);
    this.ctx.fillRect(player.x + player.width - 12, player.y + player.height - 4, 4, 3);
    
    this.ctx.restore();
  }

  // Draw alien with animation frame (0 or 1) for two-frame walk cycle
  drawAlien(alien: Alien, animationFrame: number = 0) {
    this.ctx.save();
    
    const colors = {
      squid: { main: '#fb923c', shadow: '#ea580c', glow: '#fb923c' },
      crab: { main: '#f472b6', shadow: '#db2777', glow: '#f472b6' },
      octopus: { main: '#4ade80', shadow: '#16a34a', glow: '#4ade80' },
    };
    
    const colorSet = colors[alien.type];
    const x = alien.x;
    const y = alien.y;
    const w = alien.width;
    const h = alien.height;
    
    const gradient = this.ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, colorSet.main);
    gradient.addColorStop(1, colorSet.shadow);
    
    this.ctx.fillStyle = gradient;
    this.ctx.shadowColor = colorSet.glow;
    this.ctx.shadowBlur = 8;
    
    const frame = animationFrame % 2;
    
    switch (alien.type) {
      case 'squid':
        this.drawSquid(x, y, w, h, frame, colorSet);
        break;
      case 'crab':
        this.drawCrab(x, y, w, h, frame, colorSet);
        break;
      case 'octopus':
        this.drawOctopus(x, y, w, h, frame, colorSet);
        break;
    }
    
    this.ctx.restore();
  }

  // Squid alien - top row, highest points
  // Frame 0: Tentacles spread out, frame 1: Tentacles in
  private drawSquid(x: number, y: number, w: number, h: number, frame: number, colors: { main: string; shadow: string; glow: string }) {
    const ctx = this.ctx;
    
    // Body - dome shape
    ctx.fillRect(x + 8, y + 2, w - 16, 6);
    ctx.fillRect(x + 4, y + 4, w - 8, 8);
    ctx.fillRect(x + 2, y + 8, w - 4, 4);
    
    if (frame === 0) {
      // Frame 0: Tentacles spread wide
      // Left tentacles
      ctx.fillRect(x, y + 12, 4, 4);
      ctx.fillRect(x - 2, y + 14, 4, 4);
      // Inner left
      ctx.fillRect(x + 6, y + 12, 4, 6);
      
      // Right tentacles  
      ctx.fillRect(x + w - 4, y + 12, 4, 4);
      ctx.fillRect(x + w - 2, y + 14, 4, 4);
      // Inner right
      ctx.fillRect(x + w - 10, y + 12, 4, 6);
      
      // Center tentacles
      ctx.fillRect(x + 12, y + 12, 6, 4);
    } else {
      // Frame 1: Tentacles pulled in
      // Left tentacles - angled in
      ctx.fillRect(x + 2, y + 12, 4, 6);
      ctx.fillRect(x + 6, y + 14, 4, 4);
      
      // Right tentacles - angled in
      ctx.fillRect(x + w - 6, y + 12, 4, 6);
      ctx.fillRect(x + w - 10, y + 14, 4, 4);
      
      // Center droops down
      ctx.fillRect(x + 10, y + 12, 10, 6);
    }
    
    // Eyes - always the same
    ctx.fillStyle = '#fef3c7';
    ctx.shadowBlur = 0;
    ctx.fillRect(x + 8, y + 6, 3, 3);
    ctx.fillRect(x + w - 11, y + 6, 3, 3);
    
    // Eye pupils
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 9, y + 7, 1, 1);
    ctx.fillRect(x + w - 10, y + 7, 1, 1);
  }

  // Crab alien - middle rows
  // Frame 0: Claws up, frame 1: Claws down
  private drawCrab(x: number, y: number, w: number, h: number, frame: number, colors: { main: string; shadow: string; glow: string }) {
    const ctx = this.ctx;
    
    // Main body
    ctx.fillRect(x + 4, y + 2, w - 8, 4);
    ctx.fillRect(x + 2, y + 4, w - 4, 8);
    ctx.fillRect(x + 6, y + 12, w - 12, 4);
    
    if (frame === 0) {
      // Frame 0: Claws raised up
      // Left claw
      ctx.fillRect(x - 2, y + 4, 4, 4);
      ctx.fillRect(x - 4, y + 2, 4, 4);
      ctx.fillRect(x, y + 8, 4, 4);
      
      // Right claw
      ctx.fillRect(x + w - 2, y + 4, 4, 4);
      ctx.fillRect(x + w, y + 2, 4, 4);
      ctx.fillRect(x + w - 4, y + 8, 4, 4);
      
      // Legs down
      ctx.fillRect(x + 4, y + 14, 3, 4);
      ctx.fillRect(x + 10, y + 16, 3, 2);
      ctx.fillRect(x + w - 7, y + 14, 3, 4);
      ctx.fillRect(x + w - 13, y + 16, 3, 2);
    } else {
      // Frame 1: Claws lowered
      // Left claw
      ctx.fillRect(x - 2, y + 6, 4, 4);
      ctx.fillRect(x - 4, y + 8, 4, 4);
      ctx.fillRect(x, y + 10, 4, 4);
      
      // Right claw
      ctx.fillRect(x + w - 2, y + 6, 4, 4);
      ctx.fillRect(x + w, y + 8, 4, 4);
      ctx.fillRect(x + w - 4, y + 10, 4, 4);
      
      // Legs spread out
      ctx.fillRect(x + 2, y + 14, 3, 4);
      ctx.fillRect(x + 8, y + 16, 3, 2);
      ctx.fillRect(x + w - 5, y + 14, 3, 4);
      ctx.fillRect(x + w - 11, y + 16, 3, 2);
    }
    
    // Eyes
    ctx.fillStyle = '#fef3c7';
    ctx.shadowBlur = 0;
    ctx.fillRect(x + 8, y + 4, 3, 3);
    ctx.fillRect(x + w - 11, y + 4, 3, 3);
    
    // Eye pupils
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 9, y + 5, 1, 1);
    ctx.fillRect(x + w - 10, y + 5, 1, 1);
  }

  // Octopus alien - bottom rows, easiest targets
  // Frame 0: Tentacles curled in, frame 1: Tentacles extended
  private drawOctopus(x: number, y: number, w: number, h: number, frame: number, colors: { main: string; shadow: string; glow: string }) {
    const ctx = this.ctx;
    
    // Head/body - round dome
    ctx.fillRect(x + 6, y, w - 12, 4);
    ctx.fillRect(x + 2, y + 2, w - 4, 8);
    ctx.fillRect(x + 4, y + 10, w - 8, 4);
    
    if (frame === 0) {
      // Frame 0: Tentacles curled inward
      // 4 tentacles curling in
      ctx.fillRect(x + 2, y + 12, 4, 3);
      ctx.fillRect(x + 4, y + 15, 3, 3);
      
      ctx.fillRect(x + 10, y + 12, 4, 4);
      ctx.fillRect(x + 11, y + 16, 2, 2);
      
      ctx.fillRect(x + w - 14, y + 12, 4, 4);
      ctx.fillRect(x + w - 13, y + 16, 2, 2);
      
      ctx.fillRect(x + w - 6, y + 12, 4, 3);
      ctx.fillRect(x + w - 7, y + 15, 3, 3);
    } else {
      // Frame 1: Tentacles spread outward
      // 4 tentacles spreading out
      ctx.fillRect(x, y + 12, 4, 3);
      ctx.fillRect(x - 2, y + 14, 4, 4);
      
      ctx.fillRect(x + 8, y + 12, 4, 5);
      ctx.fillRect(x + 9, y + 17, 2, 2);
      
      ctx.fillRect(x + w - 12, y + 12, 4, 5);
      ctx.fillRect(x + w - 11, y + 17, 2, 2);
      
      ctx.fillRect(x + w - 4, y + 12, 4, 3);
      ctx.fillRect(x + w - 2, y + 14, 4, 4);
    }
    
    // Eyes - big cute eyes
    ctx.fillStyle = '#fef3c7';
    ctx.shadowBlur = 0;
    ctx.fillRect(x + 6, y + 4, 4, 4);
    ctx.fillRect(x + w - 10, y + 4, 4, 4);
    
    // Eye pupils
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 8, y + 5, 2, 2);
    ctx.fillRect(x + w - 8, y + 5, 2, 2);
  }

  drawMysteryShip(mysteryShip: MysteryShip) {
    if (!mysteryShip.active) return;
    
    this.ctx.save();
    
    const x = mysteryShip.x;
    const y = mysteryShip.y;
    const width = mysteryShip.width;
    const height = mysteryShip.height;
    
    const pulse = Math.sin(this.time * 8) * 0.3 + 0.7;
    
    const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, '#f43f5e');
    gradient.addColorStop(0.5, '#e11d48');
    gradient.addColorStop(1, '#be123c');
    
    this.ctx.fillStyle = gradient;
    this.ctx.shadowColor = '#f43f5e';
    this.ctx.shadowBlur = 15 * pulse;
    
    this.ctx.beginPath();
    this.ctx.ellipse(x + width / 2, y + height / 2 + 2, width / 2, height / 3, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#fb7185';
    this.ctx.shadowBlur = 10 * pulse;
    this.ctx.beginPath();
    this.ctx.ellipse(x + width / 2, y + height / 3, width / 4, height / 4, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#fda4af';
    this.ctx.shadowBlur = 0;
    this.ctx.beginPath();
    this.ctx.ellipse(x + width / 2 - 3, y + height / 4, width / 10, height / 8, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    const lightColors = ['#fef08a', '#22d3ee', '#fef08a', '#22d3ee', '#fef08a'];
    const numLights = 5;
    const lightSpacing = (width - 10) / (numLights - 1);
    
    for (let i = 0; i < numLights; i++) {
      const lightX = x + 5 + i * lightSpacing;
      const lightY = y + height / 2 + 3;
      const lightOn = Math.sin(this.time * 12 + i * 1.5) > 0;
      
      if (lightOn) {
        this.ctx.fillStyle = lightColors[i];
        this.ctx.shadowColor = lightColors[i];
        this.ctx.shadowBlur = 8;
      } else {
        this.ctx.fillStyle = '#475569';
        this.ctx.shadowBlur = 0;
      }
      
      this.ctx.beginPath();
      this.ctx.arc(lightX, lightY, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 0.6;
    this.ctx.fillStyle = '#fef08a';
    this.ctx.shadowColor = '#fef08a';
    this.ctx.shadowBlur = 5;
    this.ctx.font = 'bold 10px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('?', x + width / 2, y - 5);
    
    this.ctx.restore();
  }

  drawPowerUp(powerUp: PowerUp) {
    this.ctx.save();
    
    const colors = POWERUP_COLORS[powerUp.type];
    const x = powerUp.x;
    const y = powerUp.y;
    const size = powerUp.width;
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    
    const pulse = Math.sin(this.time * 6) * 0.3 + 0.7;
    
    this.ctx.shadowColor = colors.glow;
    this.ctx.shadowBlur = 12 * pulse;
    
    this.ctx.fillStyle = colors.main;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, size / 2 - 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowBlur = 0;
    
    switch (powerUp.type) {
      case 'rapidFire':
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + 2, centerY - 7);
        this.ctx.lineTo(centerX - 3, centerY);
        this.ctx.lineTo(centerX + 1, centerY);
        this.ctx.lineTo(centerX - 2, centerY + 7);
        this.ctx.lineTo(centerX + 3, centerY);
        this.ctx.lineTo(centerX - 1, centerY);
        this.ctx.closePath();
        this.ctx.fill();
        break;
        
      case 'spreadShot':
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - 6);
        this.ctx.lineTo(centerX - 2, centerY + 2);
        this.ctx.lineTo(centerX + 2, centerY + 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 5, centerY - 3);
        this.ctx.lineTo(centerX - 7, centerY + 4);
        this.ctx.lineTo(centerX - 3, centerY + 3);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + 5, centerY - 3);
        this.ctx.lineTo(centerX + 7, centerY + 4);
        this.ctx.lineTo(centerX + 3, centerY + 3);
        this.ctx.closePath();
        this.ctx.fill();
        break;
        
      case 'shield':
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - 7);
        this.ctx.lineTo(centerX + 6, centerY - 4);
        this.ctx.lineTo(centerX + 6, centerY + 2);
        this.ctx.quadraticCurveTo(centerX + 4, centerY + 7, centerX, centerY + 8);
        this.ctx.quadraticCurveTo(centerX - 4, centerY + 7, centerX - 6, centerY + 2);
        this.ctx.lineTo(centerX - 6, centerY - 4);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.stroke();
        break;
        
      case 'scoreMultiplier':
        this.ctx.font = 'bold 12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('2X', centerX, centerY + 1);
        break;
    }
    
    this.ctx.globalAlpha = 0.6;
    const sparkleAngle = this.time * 3;
    for (let i = 0; i < 4; i++) {
      const angle = sparkleAngle + (i * Math.PI / 2);
      const sparkleX = centerX + Math.cos(angle) * (size / 2 + 3);
      const sparkleY = centerY + Math.sin(angle) * (size / 2 + 3);
      
      this.ctx.fillStyle = colors.glow;
      this.ctx.beginPath();
      this.ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  drawPowerUps(powerUps: PowerUp[]) {
    powerUps.forEach(powerUp => this.drawPowerUp(powerUp));
  }

  drawActivePowerUpIndicators(activePowerUps: ActivePowerUps, canvasWidth: number) {
    this.ctx.save();
    
    const now = Date.now();
    const indicators: { type: string; color: string; timeLeft: number }[] = [];
    
    if (activePowerUps.rapidFire) {
      indicators.push({ type: 'RAPID', color: POWERUP_COLORS.rapidFire.main, timeLeft: activePowerUps.rapidFire - now });
    }
    if (activePowerUps.spreadShot) {
      indicators.push({ type: 'SPREAD', color: POWERUP_COLORS.spreadShot.main, timeLeft: activePowerUps.spreadShot - now });
    }
    if (activePowerUps.shield) {
      indicators.push({ type: 'SHIELD', color: POWERUP_COLORS.shield.main, timeLeft: activePowerUps.shield - now });
    }
    if (activePowerUps.scoreMultiplier) {
      indicators.push({ type: '2X', color: POWERUP_COLORS.scoreMultiplier.main, timeLeft: activePowerUps.scoreMultiplier - now });
    }
    
    const startX = canvasWidth / 2 - (indicators.length * 50) / 2;
    const y = 565;
    
    indicators.forEach((indicator, index) => {
      const x = startX + index * 50;
      const progress = Math.max(0, indicator.timeLeft / 8000);
      
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(x, y, 45, 25);
      
      this.ctx.fillStyle = indicator.color;
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillRect(x, y, 45 * progress, 25);
      
      this.ctx.globalAlpha = 1;
      this.ctx.strokeStyle = indicator.color;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, 45, 25);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(indicator.type, x + 22, y + 16);
    });
    
    this.ctx.restore();
  }

  drawBullet(bullet: Bullet) {
    this.ctx.save();
    
    if (bullet.fromPlayer) {
      this.ctx.fillStyle = '#22d3ee';
      this.ctx.shadowColor = '#22d3ee';
      this.ctx.shadowBlur = 10;
      
      this.ctx.globalAlpha = 0.4;
      this.ctx.fillRect(bullet.x - 1, bullet.y + bullet.height, bullet.width + 2, 12);
      this.ctx.globalAlpha = 0.2;
      this.ctx.fillRect(bullet.x - 1, bullet.y + bullet.height + 8, bullet.width + 2, 8);
      this.ctx.globalAlpha = 1;
    } else {
      this.ctx.fillStyle = '#ef4444';
      this.ctx.shadowColor = '#ef4444';
      this.ctx.shadowBlur = 8;
    }
    
    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    this.ctx.restore();
  }

  // Updated to accept animation frame
  drawAliens(aliens: Alien[], animationFrame: number = 0) {
    aliens.forEach(alien => this.drawAlien(alien, animationFrame));
  }

  drawBullets(bullets: Bullet[]) {
    bullets.forEach(bullet => this.drawBullet(bullet));
  }

  drawExplosion(x: number, y: number, frame: number) {
    this.ctx.save();
    
    const maxFrames = 10;
    const progress = frame / maxFrames;
    const size = 10 + progress * 30;
    
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

  drawMysteryShipExplosion(x: number, y: number, frame: number, points: number) {
    this.ctx.save();
    
    const maxFrames = 20;
    const progress = frame / maxFrames;
    const size = 15 + progress * 50;
    
    const colors = ['#fef08a', '#f43f5e', '#be123c'];
    
    for (let layer = 0; layer < 3; layer++) {
      const layerSize = size - layer * 12;
      const layerAlpha = (1 - progress) * (1 - layer * 0.2);
      
      if (layerSize > 0 && layerAlpha > 0) {
        this.ctx.globalAlpha = Math.max(0, layerAlpha);
        this.ctx.fillStyle = colors[layer];
        this.ctx.shadowColor = colors[layer];
        this.ctx.shadowBlur = 20;
        
        this.ctx.beginPath();
        this.ctx.arc(x + 25, y + 10, layerSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    
    if (progress < 0.7) {
      const textY = y - 10 - progress * 30;
      this.ctx.globalAlpha = 1 - progress / 0.7;
      this.ctx.fillStyle = '#fef08a';
      this.ctx.shadowColor = '#fef08a';
      this.ctx.shadowBlur = 10;
      this.ctx.font = 'bold 16px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`+${points}`, x + 25, textY);
    }
    
    this.ctx.restore();
  }

  drawStars(stars: Array<{ x: number; y: number; brightness: number }>) {
    if (this.starSizes.length !== stars.length) {
      this.starSizes = stars.map(() => Math.random() > 0.85 ? 2 : 1);
    }
    
    this.ctx.save();
    
    stars.forEach((star, index) => {
      const brightness = 0.3 + star.brightness * 0.5;
      this.ctx.fillStyle = `rgba(148, 163, 184, ${brightness})`;
      this.ctx.fillRect(star.x, star.y, this.starSizes[index], this.starSizes[index]);
    });
    
    this.ctx.restore();
  }

  drawShield(shield: Shield) {
    this.ctx.save();
    
    this.ctx.fillStyle = '#4ade80';
    this.ctx.shadowColor = '#4ade80';
    this.ctx.shadowBlur = 4;
    
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

  // ==================== BOSS RENDERING ====================
  
  drawBoss(boss: Boss) {
    this.ctx.save();
    
    const x = boss.x;
    const y = boss.y;
    const w = boss.width;
    const h = boss.height;
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    
    // Get colors for this boss level (cycle through if beyond level 5)
    const colorLevel = ((boss.bossLevel - 1) % 5) + 1;
    const colors = BOSS_COLORS[colorLevel as keyof typeof BOSS_COLORS];
    
    // Pulsing effect, faster when enraged
    const pulseSpeed = boss.isEnraged ? 12 : 6;
    const pulse = Math.sin(this.time * pulseSpeed) * 0.3 + 0.7;
    
    // Screen shake effect when enraged
    if (boss.isEnraged) {
      const shakeX = Math.sin(this.time * 40) * 3;
      const shakeY = Math.cos(this.time * 35) * 2;
      this.ctx.translate(shakeX, shakeY);
    }
    
    // Draw outer energy field
    this.drawBossEnergyField(centerX, centerY, w, h, boss, colors, pulse);
    
    // Draw rotating energy rings
    this.drawBossEnergyRings(centerX, centerY, boss, colors);
    
    // Draw main body segments
    this.drawBossArmoredBody(x, y, w, h, boss, colors, pulse);
    
    // Draw the central eye cluster
    this.drawBossEyeCluster(centerX, centerY - 5, boss, colors);
    
    // Draw mechanical tentacles
    this.drawBossTentacles(x, y, w, h, boss, colors);
    
    // Draw weapon systems
    this.drawBossWeapons(x, y, w, h, boss, colors);
    
    // Draw energy particles
    this.drawBossParticles(centerX, centerY, boss, colors);
    
    // Draw enraged effects
    if (boss.isEnraged) {
      this.drawEnragedEffect(x, y, w, h, boss, colors);
    }
    
    // Draw health bar
    this.drawBossHealthBar(boss);
    
    // Draw boss level indicator
    this.drawBossLevelIndicator(boss);
    
    this.ctx.restore();
  }
  
  private drawBossEnergyField(centerX: number, centerY: number, w: number, h: number, boss: Boss, colors: { glow: string }, pulse: number) {
    const ctx = this.ctx;
    
    // Outer energy shield/aura
    const fieldSize = Math.max(w, h) * 0.7;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, fieldSize);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.6, 'transparent');
    gradient.addColorStop(0.8, `${colors.glow}20`);
    gradient.addColorStop(0.9, `${colors.glow}40`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, fieldSize * pulse, 0, Math.PI * 2);
    ctx.fill();
  }
  
  private drawBossEnergyRings(centerX: number, centerY: number, boss: Boss, colors: { glow: string; main: string }) {
    const ctx = this.ctx;
    
    // Rotating energy rings
    const numRings = boss.isEnraged ? 3 : 2;
    
    for (let ring = 0; ring < numRings; ring++) {
      const ringRadius = 45 + ring * 15;
      const rotationSpeed = (ring % 2 === 0 ? 1 : -1) * (1 + ring * 0.5);
      const rotation = this.time * rotationSpeed;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      
      ctx.strokeStyle = colors.glow;
      ctx.lineWidth = 2;
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = 10;
      ctx.globalAlpha = 0.6 - ring * 0.15;
      
      // Draw segmented ring
      const segments = 8;
      for (let i = 0; i < segments; i++) {
        const startAngle = (i / segments) * Math.PI * 2;
        const endAngle = startAngle + (Math.PI * 2 / segments) * 0.6;
        
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, startAngle, endAngle);
        ctx.stroke();
      }
      
      ctx.restore();
    }
    
    ctx.globalAlpha = 1;
  }
  
  private drawBossArmoredBody(x: number, y: number, w: number, h: number, boss: Boss, colors: { main: string; secondary: string; glow: string }, pulse: number) {
    const ctx = this.ctx;
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    
    // Main body - hexagonal armored segments
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 20 * pulse;
    
    // Core body gradient
    const bodyGradient = ctx.createRadialGradient(centerX, centerY - 10, 0, centerX, centerY, 50);
    bodyGradient.addColorStop(0, colors.glow);
    bodyGradient.addColorStop(0.3, colors.main);
    bodyGradient.addColorStop(0.7, colors.secondary);
    bodyGradient.addColorStop(1, '#1a1a2e');
    
    // Draw hexagonal main body
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    const hexRadius = 40;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = centerX + Math.cos(angle) * hexRadius;
      const py = centerY + Math.sin(angle) * hexRadius * 0.8;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    
    // Armor plating overlay
    ctx.strokeStyle = colors.glow;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Inner armor segments
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * hexRadius * 0.9,
        centerY + Math.sin(angle) * hexRadius * 0.7
      );
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    // Upper crown/crest
    const crownGradient = ctx.createLinearGradient(centerX - 30, y, centerX + 30, y + 25);
    crownGradient.addColorStop(0, colors.secondary);
    crownGradient.addColorStop(0.5, colors.main);
    crownGradient.addColorStop(1, colors.secondary);
    
    ctx.fillStyle = crownGradient;
    ctx.beginPath();
    ctx.moveTo(centerX, y - 10);
    ctx.lineTo(centerX + 35, y + 15);
    ctx.lineTo(centerX + 25, y + 25);
    ctx.lineTo(centerX, y + 15);
    ctx.lineTo(centerX - 25, y + 25);
    ctx.lineTo(centerX - 35, y + 15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = colors.glow;
    ctx.stroke();
    
    // Crown spikes
    const spikePositions = [-25, -12, 0, 12, 25];
    spikePositions.forEach((offset, i) => {
      const spikeHeight = i === 2 ? 18 : 12;
      const spikePulse = Math.sin(this.time * 8 + i) * 2;
      
      ctx.fillStyle = colors.glow;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(centerX + offset, y + 5);
      ctx.lineTo(centerX + offset - 4, y + 15);
      ctx.lineTo(centerX + offset + 4, y + 15);
      ctx.closePath();
      ctx.fill();
      
      // Spike gem
      ctx.beginPath();
      ctx.arc(centerX + offset, y - 5 - spikePulse, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  private drawBossEyeCluster(centerX: number, centerY: number, boss: Boss, colors: { eye: string; glow: string }) {
    const ctx = this.ctx;
    
    // Central large eye
    const mainEyeRadius = 18;
    const eyePulse = Math.sin(this.time * 4) * 2;
    
    // Eye socket (dark)
    ctx.fillStyle = '#0a0a12';
    ctx.shadowColor = colors.eye;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, mainEyeRadius + 4, mainEyeRadius * 0.7 + 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Main eye glow
    const eyeGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, mainEyeRadius);
    eyeGradient.addColorStop(0, '#ffffff');
    eyeGradient.addColorStop(0.2, colors.eye);
    eyeGradient.addColorStop(0.6, colors.eye);
    eyeGradient.addColorStop(1, colors.glow);
    
    ctx.fillStyle = eyeGradient;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, mainEyeRadius + eyePulse, (mainEyeRadius + eyePulse) * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupil - tracks menacingly
    const pupilOffsetX = Math.sin(this.time * 1.5) * 5;
    const pupilOffsetY = Math.cos(this.time * 1.2) * 3;
    
    ctx.fillStyle = '#0f0f1a';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.ellipse(centerX + pupilOffsetX, centerY + pupilOffsetY, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupil inner glow
    ctx.fillStyle = colors.glow;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.ellipse(centerX + pupilOffsetX, centerY + pupilOffsetY, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX - 6, centerY - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 8, centerY - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Secondary eyes (smaller, on sides)
    const sideEyePositions = [
      { x: -35, y: -5, size: 8 },
      { x: 35, y: -5, size: 8 },
      { x: -28, y: 15, size: 6 },
      { x: 28, y: 15, size: 6 },
    ];
    
    sideEyePositions.forEach((pos, i) => {
      const eyeX = centerX + pos.x;
      const eyeY = centerY + pos.y;
      const blinkPhase = Math.sin(this.time * 3 + i * 1.5);
      
      if (blinkPhase > -0.8) { // Occasional blink
        // Eye socket
        ctx.fillStyle = '#0a0a12';
        ctx.shadowColor = colors.eye;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, pos.size + 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye
        ctx.fillStyle = colors.eye;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, pos.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupil
        ctx.fillStyle = '#0f0f1a';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(eyeX + pupilOffsetX * 0.5, eyeY + pupilOffsetY * 0.5, pos.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
  
  private drawBossTentacles(x: number, y: number, w: number, h: number, boss: Boss, colors: { main: string; secondary: string; glow: string }) {
    const ctx = this.ctx;
    const centerX = x + w / 2;
    
    // Mechanical tentacles on each side
    const tentacleConfigs = [
      { side: -1, baseX: x + 15, segments: 4 },
      { side: 1, baseX: x + w - 15, segments: 4 },
    ];
    
    tentacleConfigs.forEach((config, tentIndex) => {
      const waveOffset = this.time * 3 + tentIndex * Math.PI;
      
      ctx.save();
      
      let prevX = config.baseX;
      let prevY = y + h * 0.4;
      
      for (let seg = 0; seg < config.segments; seg++) {
        const segLength = 20 - seg * 2;
        const waveAmp = 8 + seg * 3;
        const angle = Math.sin(waveOffset + seg * 0.8) * 0.4 * config.side;
        
        const nextX = prevX + config.side * (15 + Math.sin(waveOffset + seg) * waveAmp);
        const nextY = prevY + segLength;
        
        // Tentacle segment
        const segWidth = 10 - seg * 1.5;
        
        ctx.strokeStyle = colors.main;
        ctx.lineWidth = segWidth;
        ctx.lineCap = 'round';
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 5;
        
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.quadraticCurveTo(
          prevX + config.side * waveAmp * Math.sin(waveOffset),
          (prevY + nextY) / 2,
          nextX,
          nextY
        );
        ctx.stroke();
        
        // Joint orb
        if (seg < config.segments - 1) {
          ctx.fillStyle = colors.glow;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(nextX, nextY, 4 - seg * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        
        prevX = nextX;
        prevY = nextY;
      }
      
      // Claw at end
      ctx.fillStyle = colors.secondary;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(prevX + config.side * 12, prevY + 8);
      ctx.lineTo(prevX + config.side * 8, prevY + 15);
      ctx.lineTo(prevX, prevY + 10);
      ctx.lineTo(prevX - config.side * 5, prevY + 12);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    });
  }
  
  private drawBossWeapons(x: number, y: number, w: number, h: number, boss: Boss, colors: { main: string; secondary: string; glow: string }) {
    const ctx = this.ctx;
    const centerX = x + w / 2;
    const bottomY = y + h;
    
    // Central cannon
    const cannonPulse = Math.sin(this.time * 10) * 0.2 + 0.8;
    
    // Cannon housing
    const cannonGradient = ctx.createLinearGradient(centerX - 15, bottomY - 10, centerX + 15, bottomY + 20);
    cannonGradient.addColorStop(0, colors.main);
    cannonGradient.addColorStop(0.5, colors.secondary);
    cannonGradient.addColorStop(1, '#1a1a2e');
    
    ctx.fillStyle = cannonGradient;
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 10;
    
    // Main cannon body
    ctx.beginPath();
    ctx.moveTo(centerX - 12, bottomY - 5);
    ctx.lineTo(centerX + 12, bottomY - 5);
    ctx.lineTo(centerX + 8, bottomY + 20);
    ctx.lineTo(centerX - 8, bottomY + 20);
    ctx.closePath();
    ctx.fill();
    
    // Cannon barrel
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(centerX - 5, bottomY + 15, 10, 12);
    
    // Cannon energy glow
    ctx.fillStyle = colors.glow;
    ctx.globalAlpha = cannonPulse;
    ctx.beginPath();
    ctx.arc(centerX, bottomY + 25, 4 + cannonPulse * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Side weapon pods
    const podPositions = [
      { x: x + 25, y: bottomY },
      { x: x + w - 25, y: bottomY },
    ];
    
    podPositions.forEach((pos, i) => {
      const podPulse = Math.sin(this.time * 8 + i * Math.PI) * 0.3 + 0.7;
      
      // Pod housing
      ctx.fillStyle = colors.secondary;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y + 5, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Pod barrel
      ctx.fillStyle = '#2a2a3e';
      ctx.fillRect(pos.x - 3, pos.y + 10, 6, 10);
      
      // Pod glow
      ctx.fillStyle = colors.glow;
      ctx.globalAlpha = podPulse;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y + 18, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }
  
  private drawBossParticles(centerX: number, centerY: number, boss: Boss, colors: { glow: string }) {
    const ctx = this.ctx;
    
    // Floating energy particles around the boss
    const numParticles = boss.isEnraged ? 15 : 8;
    
    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2 + this.time * 0.5;
      const radiusBase = 55 + Math.sin(this.time * 2 + i) * 10;
      const radius = radiusBase + (boss.isEnraged ? 15 : 0);
      
      const px = centerX + Math.cos(angle) * radius;
      const py = centerY + Math.sin(angle) * radius * 0.6;
      const size = 2 + Math.sin(this.time * 4 + i * 0.5) * 1;
      
      ctx.fillStyle = colors.glow;
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = 10;
      ctx.globalAlpha = 0.6 + Math.sin(this.time * 3 + i) * 0.3;
      
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  }
  
  private drawEnragedEffect(x: number, y: number, w: number, h: number, boss: Boss, colors: { glow: string }) {
    const ctx = this.ctx;
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    
    // Crackling lightning effect
    ctx.strokeStyle = colors.glow;
    ctx.lineWidth = 2;
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 15;
    
    for (let i = 0; i < 6; i++) {
      const startAngle = Math.random() * Math.PI * 2;
      const startRadius = 30 + Math.random() * 20;
      const startX = centerX + Math.cos(startAngle) * startRadius;
      const startY = centerY + Math.sin(startAngle) * startRadius * 0.7;
      
      ctx.globalAlpha = 0.5 + Math.random() * 0.3;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      // Jagged lightning path
      let lx = startX;
      let ly = startY;
      for (let j = 0; j < 3; j++) {
        lx += (Math.random() - 0.5) * 30;
        ly += (Math.random() - 0.5) * 20;
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();
    }
    
    // Pulsing danger aura
    ctx.globalAlpha = 0.2 + Math.sin(this.time * 15) * 0.1;
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
  }
  
  drawBossHealthBar(boss: Boss) {
    const ctx = this.ctx;
    
    const barWidth = GAME_CONFIG.BOSS_WIDTH + 40;
    const barHeight = 12;
    const barX = boss.x + boss.width / 2 - barWidth / 2;
    const barY = boss.y - 25;
    
    const healthRatio = boss.health / boss.maxHealth;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
    
    // Health bar border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Health bar fill - color changes based on health
    let healthColor: string;
    if (healthRatio > 0.6) {
      healthColor = '#22c55e'; // Green
    } else if (healthRatio > 0.3) {
      healthColor = '#eab308'; // Yellow
    } else {
      healthColor = '#ef4444'; // Red
    }
    
    // Gradient for health bar
    const healthGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
    healthGradient.addColorStop(0, healthColor);
    healthGradient.addColorStop(0.5, '#ffffff');
    healthGradient.addColorStop(1, healthColor);
    
    ctx.fillStyle = healthGradient;
    ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * healthRatio, barHeight - 4);
    
    // Health bar glow when low
    if (healthRatio <= 0.3) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#ef4444';
      ctx.strokeRect(barX, barY, barWidth, barHeight);
      ctx.shadowBlur = 0;
    }
    
    // Phase indicators
    const phaseMarkers = [0.6, 0.3]; // Phase change points
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    phaseMarkers.forEach(marker => {
      const markerX = barX + barWidth * marker;
      ctx.beginPath();
      ctx.moveTo(markerX, barY);
      ctx.lineTo(markerX, barY + barHeight);
      ctx.stroke();
    });
  }
  
  private drawBossLevelIndicator(boss: Boss) {
    const ctx = this.ctx;
    
    // Boss name based on level
    const bossNames = ['DESTROYER', 'PHANTOM', 'TERROR', 'FURY', 'ANNIHILATOR'];
    const name = bossNames[(boss.bossLevel - 1) % 5];
    
    ctx.save();
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = boss.isEnraged ? '#ef4444' : '#ffffff';
    ctx.shadowBlur = boss.isEnraged ? 15 : 5;
    
    const text = boss.isEnraged ? `★ ${name} LV.${boss.bossLevel} ★ ENRAGED!` : `★ ${name} LV.${boss.bossLevel} ★`;
    ctx.fillText(text, boss.x + boss.width / 2, boss.y - 35);
    
    ctx.restore();
  }
  
  // Draw boss explosion (bigger and more dramatic than regular explosions)
  drawBossExplosion(x: number, y: number, width: number, height: number, frame: number, bossLevel: number) {
    this.ctx.save();
    
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const maxFrames = 40;
    const progress = frame / maxFrames;
    
    // Multiple explosion layers
    const colors = ['#ffffff', '#fef08a', '#fb923c', '#ef4444', '#dc2626'];
    
    for (let layer = 0; layer < 5; layer++) {
      const layerProgress = Math.max(0, progress - layer * 0.05);
      const size = (50 + layer * 30) * layerProgress * (1 + bossLevel * 0.2);
      const alpha = (1 - layerProgress) * (1 - layer * 0.15);
      
      if (size > 0 && alpha > 0) {
        this.ctx.globalAlpha = Math.max(0, alpha);
        this.ctx.fillStyle = colors[layer];
        this.ctx.shadowColor = colors[layer];
        this.ctx.shadowBlur = 30;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    
    // Particle debris
    if (progress < 0.7) {
      const numParticles = 20 + bossLevel * 5;
      for (let i = 0; i < numParticles; i++) {
        const angle = (i / numParticles) * Math.PI * 2;
        const distance = progress * 150 * (1 + Math.random() * 0.5);
        const particleX = centerX + Math.cos(angle) * distance;
        const particleY = centerY + Math.sin(angle) * distance;
        const particleSize = 3 + Math.random() * 4;
        
        this.ctx.globalAlpha = 1 - progress;
        this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        this.ctx.beginPath();
        this.ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    
    // "BOSS DEFEATED" text
    if (progress > 0.3 && progress < 0.9) {
      const textAlpha = progress < 0.6 ? (progress - 0.3) / 0.3 : (0.9 - progress) / 0.3;
      this.ctx.globalAlpha = textAlpha;
      this.ctx.fillStyle = '#fef08a';
      this.ctx.shadowColor = '#fef08a';
      this.ctx.shadowBlur = 20;
      this.ctx.font = 'bold 24px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('BOSS DEFEATED!', centerX, centerY - 40 - progress * 30);
    }
    
    this.ctx.restore();
  }
}
