import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameState } from '../types/game';

interface GameOverMenuProps {
  gameState: GameState;
  onRestartGame: () => void;
  onMainMenu: () => void;
}

export function GameOverMenu({ gameState, onRestartGame, onMainMenu }: GameOverMenuProps) {
  const isNewHighScore = gameState.score >= gameState.highScore && gameState.score > 0;
  
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-red-950/20 to-slate-950 flex items-center justify-center overflow-hidden">
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-red-500/30 animate-pulse"
            style={{
              width: '4px',
              height: '4px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/3 -left-32 w-64 h-64 bg-red-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -right-32 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
      
      <Card className="relative bg-slate-900/90 border-2 border-red-500/50 shadow-2xl shadow-red-500/20 backdrop-blur-sm max-w-md mx-4">
        <CardContent className="p-8 md:p-10 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          
          <div className="mb-6">
            <h1 className="text-5xl md:text-6xl font-black text-red-500 mb-2" style={{ textShadow: '0 0 40px rgba(239, 68, 68, 0.5)' }}>
              GAME OVER
            </h1>
            <p className="text-slate-400">Your mission has ended</p>
          </div>
          
          {isNewHighScore && (
            <div className="mb-6 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/50 animate-pulse">
              <div className="text-yellow-400 font-bold text-lg">🏆 NEW HIGH SCORE! 🏆</div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Final Score</div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">{gameState.score.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Wave Reached</div>
              <div className="text-2xl font-bold text-orange-400 font-mono">{gameState.wave}</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={onRestartGame}
              className="w-full py-5 text-lg font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 border-0"
            >
              TRY AGAIN
            </Button>
            <Button 
              onClick={onMainMenu}
              variant="outline"
              className="w-full py-5 text-lg font-semibold border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              MAIN MENU
            </Button>
          </div>
          
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        </CardContent>
      </Card>
    </div>
  );
}
