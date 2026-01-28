import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameState } from '../types/game';

interface PauseMenuProps {
  gameState: GameState;
  onResumeGame: () => void;
  onMainMenu: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function PauseMenu({ gameState, onResumeGame, onMainMenu, soundEnabled, onToggleSound }: PauseMenuProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: Math.random() > 0.7 ? '3px' : '2px',
              height: Math.random() > 0.7 ? '3px' : '2px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: '#22d3ee',
              opacity: 0.3 + Math.random() * 0.3,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      <Card className="relative bg-slate-900/95 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 max-w-md mx-4 backdrop-blur-sm">
        <CardContent className="p-8">
          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          
          {/* Header with custom pause icon */}
          <div className="text-center mb-6">
            {/* Custom pause icon */}
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-xl blur-xl animate-pulse" />
              <div className="relative w-full h-full bg-gradient-to-b from-slate-700 to-slate-800 rounded-xl border-2 border-cyan-500/50 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <div className="flex gap-2">
                  <div className="w-2.5 h-8 bg-gradient-to-b from-cyan-300 to-cyan-500 rounded-sm" />
                  <div className="w-2.5 h-8 bg-gradient-to-b from-cyan-300 to-cyan-500 rounded-sm" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-wider" style={{ 
              background: 'linear-gradient(to bottom, #67e8f9, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(34, 211, 238, 0.5)' 
            }}>
              PAUSED
            </h1>
          </div>
          
          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Wave</div>
              <div className="text-xl font-bold text-cyan-400 font-mono">{gameState.wave}</div>
            </div>
            <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Score</div>
              <div className="text-xl font-bold text-cyan-400 font-mono">{gameState.score.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Lives</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {Array.from({ length: Math.min(gameState.lives, 5) }).map((_, i) => (
                  <div 
                    key={i}
                    className="w-4 h-3"
                    style={{
                      background: 'linear-gradient(to bottom, #22d3ee, #0891b2)',
                      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                      filter: 'drop-shadow(0 0 3px rgba(34, 211, 238, 0.6))',
                    }}
                  />
                ))}
                {gameState.lives > 5 && (
                  <span className="text-xs text-cyan-400 ml-1">+{gameState.lives - 5}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Controls Reminder */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-3 text-center">Controls</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Move</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300 border border-slate-600">←</kbd>
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300 border border-slate-600">→</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Fire</span>
                <kbd className="px-3 py-1 bg-slate-700 rounded text-xs text-slate-300 border border-slate-600">SPACE</kbd>
              </div>
            </div>
          </div>
          
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="w-full mb-6 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors flex items-center justify-between"
          >
            <span className="text-slate-400 text-sm">Sound Effects</span>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${soundEnabled ? 'bg-cyan-500' : 'bg-slate-600'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </button>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={onResumeGame}
              className="w-full py-5 text-lg font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/30 transition-all hover:scale-[1.02] border-0"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              RESUME
            </Button>
            <Button 
              onClick={onMainMenu}
              variant="outline"
              className="w-full py-5 text-lg font-semibold border-slate-600 text-slate-300 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              QUIT TO MENU
            </Button>
          </div>
          
          {/* Hint text */}
          <p className="text-center text-slate-500 text-xs mt-4">
            Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400 border border-slate-600">ESC</kbd> to resume
          </p>
          
          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        </CardContent>
      </Card>
    </div>
  );
}
