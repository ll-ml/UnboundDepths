import * as THREE from 'three';
import { TileType } from './types.js';
import { DungeonObject } from './dungeonObject.js';

export class Enemy extends DungeonObject {
  /**
   * @param {string} id - Unique identifier
   * @param {number} hp - Hit points
   * @param {number} x - Starting x tile coord
   * @param {number} y - Startin y tile coord
   * @param {number} atk - Attack power
   * @param {number} agroRange - Range where enemy will attack player
   */
  constructor(id, hp, x, y, atk, agroRange = 10) {
    const textureMap = {
      cyclopes: './tile_0109.png',
      spider: './tile_0122.png',
    };
    const texturePath = textureMap[id.toLocaleLowerCase()] || '/tile_0019.png';
    super(texturePath, x, y);
    this.id = id;
    this.hp = hp;
    this.attackPower = atk;
    this.agroRange = agroRange;
  }

  move(updatedPos) {
    this.coords.copy(updatedPos);
    this.updateMeshPosition();
  }

  /**
   * Attempt to move toward the player.
   * @param {THREE.Vector2} playerPos - The player's tile coordinates.
   * @param {Array<Array<any>>} tiles - The 2D dense matrix of tile types.
   * @returns {THREE.Vector2} - The next tile position for the enemy.
   */
  tryMove(playerPos, tiles) {
    const rows = tiles.length;
    const cols = tiles[0].length;
    const manhattanDist = Math.abs(this.coords.x - playerPos.x) + Math.abs(this.coords.y - playerPos.y);
    
    // If the player is too far, do nothing.
    if (manhattanDist > this.agroRange) {
      return this.coords.clone();
    }
    
    const directions = [
      new THREE.Vector2(1, 0),
      new THREE.Vector2(-1, 0),
      new THREE.Vector2(0, 1),
      new THREE.Vector2(0, -1)
    ];
    
    // Initialize distance and previous matrices.
    const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const prev = Array.from({ length: rows }, () => Array(cols).fill(null));
    
    // Simple priority queue implemented as an array.
    // Each element is an object: { dist: number, pos: THREE.Vector2 }
    let pq = [];
    
    const startX = this.coords.x;
    const startY = this.coords.y;
    dist[startY][startX] = 0;
    pq.push({ dist: 0, pos: new THREE.Vector2(startX, startY) });
    
    let finalPos = null;
    
    while (pq.length > 0) {
      // Sort by distance ascending.
      pq.sort((a, b) => a.dist - b.dist);
      const { dist: currentDist, pos: currentPos } = pq.shift();
      
      // If we are adjacent to the player, stop.
      if (Math.abs(currentPos.x - playerPos.x) + Math.abs(currentPos.y - playerPos.y) === 1) {
        finalPos = currentPos;
        break;
      }
      
      // Explore neighbors.
      for (const dir of directions) {
        const nextPos = new THREE.Vector2(currentPos.x + dir.x, currentPos.y + dir.y);
        // Check bounds.
        if (nextPos.x < 0 || nextPos.y < 0 || nextPos.x >= cols || nextPos.y >= rows) {
          continue;
        }
        // Skip walls.
        if (!this.canWalk(tiles[nextPos.y][nextPos.x])) {
          continue;
        }
        const newDist = currentDist + 1;
        if (newDist < dist[nextPos.y][nextPos.x]) {
          dist[nextPos.y][nextPos.x] = newDist;
          prev[nextPos.y][nextPos.x] = currentPos;
          pq.push({ dist: newDist, pos: nextPos });
        }
      }
    }
    
    // If no adjacent tile was found, don't move.
    if (!finalPos) {
      return this.coords.clone();
    }
    
    // Backtrack from finalPos until we reach our own coordinates.
    let step = finalPos;
    while (prev[step.y][step.x] && !prev[step.y][step.x].equals(this.coords)) {
      step = prev[step.y][step.x];
      // If there’s a broken link, stay put.
      if (!step) {
        return this.coords.clone();
      }
    }
    
    // next move towards the player.
    return step;
  }

  idle(tiles) {
    const rows = tiles.length;
    const cols = tiles[0].length;
    const directions = [
      new THREE.Vector2(1, 0),
      new THREE.Vector2(-1, 0),
      new THREE.Vector2(0, 1),
      new THREE.Vector2(0, -1)
    ];
    
    let tries = 4;
    while (tries-- > 0) {
      const idx = Math.floor(Math.random() * directions.length);
      const nextPos = this.coords.clone().add(directions[idx]);
      if (nextPos.x < 0 || nextPos.y < 0 || nextPos.x >= cols || nextPos.y >= rows) {
        continue;
      }
      if (!this.canWalk(tiles[nextPos.y][nextPos.x])) {
        continue;
      }
      return nextPos;
    }
    return this.coords.clone(); // return null more effiecnt here?
  }

  canWalk(tile) {
    return tile !== TileType.WALL && tile !== TileType.WATER & tile !== TileType.DIRT && tile !== TileType.PEBBLE_DIRT && tile !== TileType.ROCK_DIRT;
  }
}
