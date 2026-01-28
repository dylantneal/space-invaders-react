import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameState } from '../types/game';

interface StartMenuProps {
  gameState: GameState;
  onStartGame: () => void;
}

export function StartMenu({ gameState, onStartGame }: StartMenuProps) {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() > 0.8 ? '3px' : '2px',
              height: Math.random() > 0.8 ? '3px' : '2px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.7,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <Card className="relative bg-slate-900/80 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 backdrop-blur-sm max-w-lg mx-4">
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
                {/* Mini alien icons */}
                <div className="w-4 h-3 bg-orange-400 rounded-sm" />
                <div className="w-4 h-3 bg-rose-500 rounded-sm" />
                <div className="w-4 h-3 bg-green-400 rounded-sm" />
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
            <span>GALACTIC DEFENSE CORPS</span>
          </div>
          
          {/* Decorative bottom border glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
        </CardContent>
      </Card>
    </div>
  );
}
