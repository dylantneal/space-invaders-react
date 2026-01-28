import React from 'react';
import { GameState, GAME_CONFIG } from '../types/game';
import { isBossWave } from '../lib/game-engine';

interface GameHUDProps {
  gameState: GameState;
}

export function GameHUD({ gameState }: GameHUDProps) {
  const onBossWave = isBossWave(gameState.wave);
  const maxLivesDisplay = Math.max(gameState.lives, 5);
  
  return (
    <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none">
      {/* Left Panel - Score */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded p-2 min-w-[100px]">
        <div className="space-y-1">
          <div>
            <div className="text-[8px] text-slate-400 uppercase tracking-wider">Score</div>
            <div className="text-sm font-bold text-cyan-400 font-mono" style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.5)' }}>
              {gameState.score.toLocaleString().padStart(6, '0')}
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
          <div>
            <div className="text-[8px] text-slate-400 uppercase tracking-wider">High Score</div>
            <div className="text-xs font-semibold text-orange-400 font-mono">
              {gameState.highScore.toLocaleString().padStart(6, '0')}
            </div>
          </div>
        </div>
      </div>
      
      {/* Center Panel - Wave */}
      <div className={`bg-slate-900/80 backdrop-blur-sm border rounded px-4 py-1.5 text-center ${onBossWave ? 'border-red-500/50 animate-pulse' : 'border-cyan-500/30'}`}>
        {onBossWave ? (
          <>
            <div className="text-[8px] text-red-400 uppercase tracking-wider font-bold">⚠️ BOSS WAVE ⚠️</div>
            <div className="text-xl font-black text-red-400 font-mono" style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}>
              {gameState.wave}
            </div>
            <div className="text-[10px] text-red-500/80 font-mono mt-1">
              BOSS LV.{Math.floor(gameState.wave / GAME_CONFIG.BOSS_WAVE_INTERVAL)}
            </div>
          </>
        ) : (
          <>
            <div className="text-[8px] text-slate-400 uppercase tracking-wider">Wave</div>
            <div className="text-xl font-black text-cyan-400 font-mono" style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.5)' }}>
              {gameState.wave}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              SECTOR {String(gameState.wave).padStart(3, '0')}
            </div>
          </>
        )}
      </div>
      
      {/* Right Panel - Lives */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded p-2 min-w-[100px]">
        <div>
          <div className="text-[8px] text-slate-400 uppercase tracking-wider mb-1">Lives</div>
          <div className="flex items-center justify-end gap-0.5 flex-wrap">
            {Array.from({ length: maxLivesDisplay }).map((_, i) => (
              <div 
                key={i}
                className={`w-5 h-4 transition-all duration-300 ${i < gameState.lives ? 'opacity-100' : 'opacity-20'}`}
                style={{
                  background: i < gameState.lives 
                    ? 'linear-gradient(to bottom, #22d3ee, #0891b2)'
                    : '#334155',
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  filter: i < gameState.lives ? 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))' : 'none',
                }}
              />
            ))}
          </div>
          {gameState.lives > 5 && (
            <div className="text-xs text-cyan-400 font-mono text-right mt-1">×{gameState.lives}</div>
          )}
        </div>
      </div>
    </div>
  );
}
