import { useCallback } from 'react';
import { Entity, Player, Alien, Bullet } from '../types/game';

export function useCollision() {
  const checkCollision = useCallback((entity1: Entity, entity2: Entity): boolean => {
    return (
      entity1.x < entity2.x + entity2.width &&
      entity1.x + entity1.width > entity2.x &&
      entity1.y < entity2.y + entity2.height &&
      entity1.y + entity1.height > entity2.y
    );
  }, []);

  const checkBulletAlienCollisions = useCallback((bullets: Bullet[], aliens: Alien[]) => {
    const collisions: Array<{ bulletIndex: number; alienIndex: number; points: number }> = [];
    
    bullets.forEach((bullet, bulletIndex) => {
      if (!bullet.fromPlayer) return;
      
      aliens.forEach((alien, alienIndex) => {
        if (checkCollision(bullet, alien)) {
          collisions.push({ bulletIndex, alienIndex, points: alien.points });
        }
      });
    });
    
    return collisions;
  }, [checkCollision]);

  const checkPlayerAlienCollisions = useCallback((player: Player, aliens: Alien[]): boolean => {
    return aliens.some(alien => checkCollision(player, alien));
  }, [checkCollision]);

  const checkPlayerBulletCollisions = useCallback((player: Player, bullets: Bullet[]): boolean => {
    return bullets.some(bullet => !bullet.fromPlayer && checkCollision(player, bullet));
  }, [checkCollision]);

  const checkAliensReachedBottom = useCallback((aliens: Alien[], canvasHeight: number): boolean => {
    return aliens.some(alien => alien.y + alien.height >= canvasHeight - 50); // Allow aliens to come closer before game over
  }, []);

  return {
    checkCollision,
    checkBulletAlienCollisions,
    checkPlayerAlienCollisions,
    checkPlayerBulletCollisions,
    checkAliensReachedBottom,
  };
}