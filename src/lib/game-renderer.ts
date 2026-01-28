import { Player, Alien, Bullet, Shield, MysteryShip, PowerUp, ActivePowerUps, POWERUP_COLORS } from '../types/game';

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
}
