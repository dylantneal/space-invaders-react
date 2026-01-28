import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameState, BossReward, GAME_CONFIG } from '../types/game';
import { isBossWave } from '../lib/game-engine';

interface VictoryMenuProps {
  gameState: GameState;
  onNextWave: () => void;
  onMainMenu: () => void;
  bossRewards?: BossReward[];
  bossLevel?: number;
}

export function VictoryMenu({ gameState, onNextWave, onMainMenu, bossRewards = [], bossLevel = 0 }: VictoryMenuProps) {
  const wasBossWave = isBossWave(gameState.wave);
  
  const getRewardLabel = (reward: BossReward): string => {
    switch (reward.type) {
      case 'extraLife': return '❤️ Extra Life';
      case 'megaPoints': return `💎 +${reward.value} Points`;
      case 'rapidFire': return '⚡ Rapid Fire';
      case 'spreadShot': return '🔱 Spread Shot';
      case 'shield': return '🛡️ Shield';
      case 'scoreMultiplier': return '✨ 2X Score';
      case 'fullShields': return '🏰 Full Shields';
      default: return '🎁 Bonus';
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-cyan-950/20 to-slate-950 flex items-center justify-center overflow-hidden">
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: Math.random() > 0.7 ? '4px' : '2px',
              height: Math.random() > 0.7 ? '4px' : '2px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 3 === 0 ? '#22d3ee' : i % 3 === 1 ? '#4ade80' : '#fb923c',
              opacity: 0.4 + Math.random() * 0.4,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      <div className="absolute top-1/3 -left-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -right-32 w-64 h-64 bg-green-500/20 rounded-full blur-3xl" />
      
      <Card className="relative bg-slate-900/90 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 backdrop-blur-sm max-w-md mx-4">
        <CardContent className="p-8 md:p-10 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          
          {/* Victory Icon - Stylized star burst */}
          <div className="mb-6 relative">
            <div className="w-20 h-20 mx-auto relative">
              {/* Outer glow */}
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
              {/* Star shape using CSS */}
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
                <polygon 
                  points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" 
                  fill="url(#starGradient)"
                  stroke="#22d3ee"
                  strokeWidth="2"
                />
                <defs>
                  <linearGradient id="starGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          <div className="mb-6">
            {wasBossWave ? (
              <>
                <h1 className="text-3xl md:text-4xl font-black mb-2">
                  <span className="bg-gradient-to-b from-amber-300 to-amber-500 bg-clip-text text-transparent" style={{ textShadow: '0 0 40px rgba(251, 191, 36, 0.5)' }}>
                    BOSS DEFEATED!
                  </span>
                </h1>
                <h2 className="text-xl md:text-2xl font-bold text-cyan-400" style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.5)' }}>
                  LEVEL {bossLevel} DESTROYED
                </h2>
                <p className="text-slate-400 mt-2">Outstanding victory, Commander!</p>
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-black mb-2">
                  <span className="bg-gradient-to-b from-cyan-300 to-cyan-500 bg-clip-text text-transparent" style={{ textShadow: '0 0 40px rgba(34, 211, 238, 0.5)' }}>
                    WAVE {gameState.wave}
                  </span>
                </h1>
                <h2 className="text-2xl md:text-3xl font-bold text-green-400" style={{ textShadow: '0 0 20px rgba(74, 222, 128, 0.5)' }}>
                  COMPLETE
                </h2>
                <p className="text-slate-400 mt-2">Excellent work, Commander!</p>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Score</div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">{gameState.score.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Lives</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {Array.from({ length: Math.max(gameState.lives, 5) }).map((_, i) => (
                  <div 
                    key={i}
                    className="w-5 h-4"
                    style={{
                      background: i < gameState.lives 
                        ? 'linear-gradient(to bottom, #22d3ee, #0891b2)'
                        : '#334155',
                      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                      filter: i < gameState.lives ? 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.6))' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {wasBossWave && bossRewards.length > 0 ? (
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
              <div className="text-amber-300 font-bold mb-2 text-center">🏆 BOSS REWARDS 🏆</div>
              <div className="grid grid-cols-2 gap-2">
                {bossRewards.map((reward, index) => (
                  <div 
                    key={index} 
                    className="text-sm text-amber-200 bg-slate-800/50 rounded px-2 py-1 text-center"
                  >
                    {getRewardLabel(reward)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <div className="flex items-center justify-center gap-2 text-cyan-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-semibold">1 Life Bonus Awarded</span>
              </div>
            </div>
          )}
          
          {/* Preview next wave */}
          {isBossWave(gameState.wave + 1) && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 animate-pulse">
              <div className="flex items-center justify-center gap-2 text-red-400">
                <span className="text-2xl">⚠️</span>
                <span className="font-bold">BOSS INCOMING - WAVE {gameState.wave + 1}</span>
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={onNextWave}
              className="w-full py-5 text-lg font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 border-0"
            >
              <span className="flex items-center justify-center gap-2">
                WAVE {gameState.wave + 1}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Button>
            <Button 
              onClick={onMainMenu}
              variant="outline"
              className="w-full py-5 text-lg font-semibold border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              MAIN MENU
            </Button>
          </div>
          
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        </CardContent>
      </Card>
    </div>
  );
}
