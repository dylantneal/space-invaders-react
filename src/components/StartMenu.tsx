import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameState } from '../types/game';

interface StartMenuProps {
  gameState: GameState;
  onStartGame: () => void;
}

// Alien sprite component using CSS/SVG
function AlienSprite({ type, x, y, size, animationDelay, duration }: { 
  type: 'squid' | 'crab' | 'octopus';
  x: number;
  y: number;
  size: number;
  animationDelay: number;
  duration: number;
}) {
  const colors = {
    squid: { main: '#fb923c', glow: 'rgba(251, 146, 60, 0.6)' },
    crab: { main: '#f472b6', glow: 'rgba(244, 114, 182, 0.6)' },
    octopus: { main: '#4ade80', glow: 'rgba(74, 222, 128, 0.6)' },
  };

  const color = colors[type];

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        animation: `float ${duration}s ease-in-out infinite, bob ${2 + Math.random()}s ease-in-out infinite`,
        animationDelay: `${animationDelay}s`,
        filter: `drop-shadow(0 0 ${size / 3}px ${color.glow})`,
        opacity: 0.7,
      }}
    >
      <svg viewBox="0 0 32 32" width={size} height={size}>
        {type === 'squid' && (
          <g fill={color.main}>
            {/* Body dome */}
            <rect x="10" y="4" width="12" height="6" rx="1" />
            <rect x="6" y="6" width="20" height="8" rx="1" />
            <rect x="4" y="10" width="24" height="4" />
            {/* Tentacles */}
            <rect x="2" y="14" width="4" height="6" rx="1">
              <animate attributeName="y" values="14;16;14" dur="0.5s" repeatCount="indefinite" />
            </rect>
            <rect x="8" y="14" width="4" height="8" rx="1">
              <animate attributeName="height" values="8;6;8" dur="0.6s" repeatCount="indefinite" />
            </rect>
            <rect x="14" y="14" width="4" height="6" rx="1" />
            <rect x="20" y="14" width="4" height="8" rx="1">
              <animate attributeName="height" values="8;6;8" dur="0.6s" repeatCount="indefinite" />
            </rect>
            <rect x="26" y="14" width="4" height="6" rx="1">
              <animate attributeName="y" values="14;16;14" dur="0.5s" repeatCount="indefinite" />
            </rect>
            {/* Eyes */}
            <rect x="10" y="8" width="3" height="3" fill="#fef3c7" />
            <rect x="19" y="8" width="3" height="3" fill="#fef3c7" />
            <rect x="11" y="9" width="1" height="1" fill="#1e293b" />
            <rect x="20" y="9" width="1" height="1" fill="#1e293b" />
          </g>
        )}
        {type === 'crab' && (
          <g fill={color.main}>
            {/* Body */}
            <rect x="6" y="6" width="20" height="4" rx="1" />
            <rect x="4" y="8" width="24" height="10" rx="1" />
            <rect x="8" y="18" width="16" height="4" />
            {/* Claws */}
            <rect x="0" y="6" width="4" height="4" rx="1">
              <animate attributeName="y" values="6;8;6" dur="0.4s" repeatCount="indefinite" />
            </rect>
            <rect x="0" y="10" width="4" height="4" rx="1" />
            <rect x="28" y="6" width="4" height="4" rx="1">
              <animate attributeName="y" values="6;8;6" dur="0.4s" repeatCount="indefinite" />
            </rect>
            <rect x="28" y="10" width="4" height="4" rx="1" />
            {/* Legs */}
            <rect x="6" y="20" width="3" height="6" rx="1">
              <animate attributeName="height" values="6;4;6" dur="0.3s" repeatCount="indefinite" />
            </rect>
            <rect x="14" y="22" width="3" height="4" rx="1" />
            <rect x="23" y="20" width="3" height="6" rx="1">
              <animate attributeName="height" values="6;4;6" dur="0.3s" repeatCount="indefinite" />
            </rect>
            {/* Eyes */}
            <rect x="10" y="10" width="3" height="3" fill="#fef3c7" />
            <rect x="19" y="10" width="3" height="3" fill="#fef3c7" />
            <rect x="11" y="11" width="1" height="1" fill="#1e293b" />
            <rect x="20" y="11" width="1" height="1" fill="#1e293b" />
          </g>
        )}
        {type === 'octopus' && (
          <g fill={color.main}>
            {/* Head dome */}
            <rect x="8" y="2" width="16" height="4" rx="2" />
            <rect x="4" y="4" width="24" height="10" rx="1" />
            <rect x="6" y="14" width="20" height="4" />
            {/* Tentacles */}
            <rect x="4" y="16" width="4" height="6" rx="1">
              <animate attributeName="x" values="4;2;4" dur="0.7s" repeatCount="indefinite" />
            </rect>
            <rect x="10" y="16" width="3" height="8" rx="1">
              <animate attributeName="height" values="8;10;8" dur="0.5s" repeatCount="indefinite" />
            </rect>
            <rect x="15" y="16" width="3" height="6" rx="1" />
            <rect x="20" y="16" width="3" height="8" rx="1">
              <animate attributeName="height" values="8;10;8" dur="0.5s" repeatCount="indefinite" />
            </rect>
            <rect x="25" y="16" width="4" height="6" rx="1">
              <animate attributeName="x" values="25;27;25" dur="0.7s" repeatCount="indefinite" />
            </rect>
            {/* Big eyes */}
            <rect x="8" y="6" width="5" height="5" fill="#fef3c7" rx="1" />
            <rect x="19" y="6" width="5" height="5" fill="#fef3c7" rx="1" />
            <rect x="10" y="8" width="2" height="2" fill="#1e293b" />
            <rect x="21" y="8" width="2" height="2" fill="#1e293b" />
          </g>
        )}
      </svg>
    </div>
  );
}

// Glowing star component
function GlowingStar({ x, y, size, color, delay, twinkleDuration }: {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  twinkleDuration: number;
}) {
  return (
    <div
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 ${size * 2}px ${size}px ${color}, 0 0 ${size * 4}px ${size * 2}px ${color}`,
        animation: `twinkle ${twinkleDuration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

// Shooting star component
function ShootingStar({ delay }: { delay: number }) {
  const startX = useMemo(() => Math.random() * 60 + 20, []);
  const startY = useMemo(() => Math.random() * 30, []);
  
  return (
    <div
      className="absolute w-1 h-1 bg-white rounded-full"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        boxShadow: '0 0 4px 2px rgba(255,255,255,0.8), -20px 0 15px 2px rgba(255,255,255,0.4), -40px 0 10px 1px rgba(255,255,255,0.2)',
        animation: `shootingStar 3s linear infinite`,
        animationDelay: `${delay}s`,
        opacity: 0,
      }}
    />
  );
}

export function StartMenu({ gameState, onStartGame }: StartMenuProps) {
  const [animationFrame, setAnimationFrame] = useState(0);

  // Animate aliens frame switching
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(f => (f + 1) % 2);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Generate stars with different properties
  const stars = useMemo(() => {
    const starColors = [
      'rgba(255, 255, 255, 0.9)',
      'rgba(255, 255, 255, 0.7)',
      'rgba(34, 211, 238, 0.8)', // cyan
      'rgba(251, 146, 60, 0.7)', // orange
      'rgba(244, 114, 182, 0.6)', // pink
    ];

    return Array.from({ length: 80 }).map((_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() > 0.9 ? 3 : Math.random() > 0.7 ? 2 : 1,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      delay: Math.random() * 5,
      twinkleDuration: 1.5 + Math.random() * 2,
    }));
  }, []);

  // Generate floating aliens
  const aliens = useMemo(() => {
    const types: ('squid' | 'crab' | 'octopus')[] = ['squid', 'crab', 'octopus'];
    return Array.from({ length: 12 }).map((_, i) => ({
      type: types[i % 3],
      x: Math.random() * 90 + 5,
      y: Math.random() * 80 + 10,
      size: 28 + Math.random() * 20,
      animationDelay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
      {/* CSS Keyframes */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(10px, -15px) rotate(3deg); }
          50% { transform: translate(-5px, -25px) rotate(-2deg); }
          75% { transform: translate(-15px, -10px) rotate(2deg); }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shootingStar {
          0% { opacity: 0; transform: translate(0, 0); }
          10% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translate(200px, 150px); }
        }
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 10px currentColor); }
          50% { filter: drop-shadow(0 0 20px currentColor) drop-shadow(0 0 30px currentColor); }
        }
      `}</style>

      {/* Glowing stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star, i) => (
          <GlowingStar key={i} {...star} />
        ))}
      </div>

      {/* Shooting stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ShootingStar delay={0} />
        <ShootingStar delay={4} />
        <ShootingStar delay={8} />
      </div>

      {/* Floating aliens */}
      <div className="absolute inset-0 overflow-hidden">
        {aliens.map((alien, i) => (
          <AlienSprite key={i} {...alien} />
        ))}
      </div>
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      {/* Nebula effect */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-2xl" />
      
      <Card className="relative bg-slate-900/80 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 backdrop-blur-sm max-w-lg mx-4 z-10">
        <CardContent className="p-8 md:p-12 text-center">
          {/* Decorative top border glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          
          {/* Title section */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-black tracking-wider mb-2">
              <span className="bg-gradient-to-b from-cyan-300 to-cyan-500 bg-clip-text text-transparent drop-shadow-lg" style={{ textShadow: '0 0 40px rgba(34, 211, 238, 0.5)' }}>
                ALIEN
              </span>
            </h1>
            <h1 className="text-6xl md:text-7xl font-black tracking-wider">
              <span className="bg-gradient-to-b from-orange-300 to-orange-500 bg-clip-text text-transparent" style={{ textShadow: '0 0 40px rgba(251, 146, 60, 0.5)' }}>
                INVADERS
              </span>
            </h1>
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-500/50" />
              <div className="flex gap-2">
                {/* Mini alien icons with glow */}
                <div className="w-4 h-3 bg-orange-400 rounded-sm shadow-lg shadow-orange-400/50" />
                <div className="w-4 h-3 bg-rose-500 rounded-sm shadow-lg shadow-rose-500/50" />
                <div className="w-4 h-3 bg-green-400 rounded-sm shadow-lg shadow-green-400/50" />
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-500/50" />
            </div>
            <p className="text-cyan-100/70 text-lg mt-4 font-light">
              Defend the galaxy from the alien invasion!
            </p>
          </div>
          
          {/* High Score Display */}
          <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-cyan-500/30">
            <div className="text-xs text-cyan-400 uppercase tracking-widest mb-1">Galactic Record</div>
            <div className="text-3xl font-bold text-orange-400 font-mono">
              {gameState.highScore.toLocaleString().padStart(6, '0')}
            </div>
          </div>
          
          {/* Controls */}
          <div className="mb-8 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <div className="text-xs text-cyan-400 uppercase tracking-widest mb-3">Mission Briefing</div>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
              <div className="flex items-center justify-end gap-2 pr-2">
                <span className="text-slate-400">Move</span>
              </div>
              <div className="flex items-center gap-2 pl-2">
                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">←</kbd>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">→</kbd>
              </div>
              <div className="flex items-center justify-end gap-2 pr-2">
                <span className="text-slate-400">Fire</span>
              </div>
              <div className="flex items-center gap-2 pl-2">
                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">SPACE</kbd>
              </div>
              <div className="flex items-center justify-end gap-2 pr-2">
                <span className="text-slate-400">Pause</span>
              </div>
              <div className="flex items-center gap-2 pl-2">
                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">ESC</kbd>
              </div>
            </div>
          </div>
          
          {/* Launch Button */}
          <Button 
            onClick={onStartGame}
            className="w-full py-6 text-xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/50 border-0"
          >
            <span className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              LAUNCH MISSION
            </span>
          </Button>
          
          {/* Footer */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span>v2.1</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>DYLAN NEAL</span>
          </div>
          
          {/* Decorative bottom border glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
        </CardContent>
      </Card>
    </div>
  );
}
