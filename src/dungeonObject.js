import * as THREE from 'three';

const TILE_SIZE = 16; // TODO: Make sure its ok
const WIDTH = 40;   // columns
const HEIGHT = 30;  // rows

export class DungeonObject {
     /**
   * @param {THREE.Object3D} baseObject  A loaded GLTF scene or a Mesh you want to reuse.
   * @param {number} gridX               Column index in the dungeon grid.
   * @param {number} gridY               Row index in the dungeon grid.
   * @param {THREE.Vector3} worldOffset  An offset to center or translate the entire dungeon.
   * @param {number} scale               Uniform scale factor for the object.
   */
    constructor(baseObject, gridX, gridY, worldOffset = new THREE.Vector3(), scale = 10) {
        this.mesh = baseObject.clone(true);
        this.mesh.scale.set(scale, scale, scale);

        this.grid = new THREE.Vector2(gridX, gridY);
        this.worldOffset = worldOffset.clone();
        this.updateMeshPosition();
    }

    updateMeshPosition() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const dungeonPixelWidth = WIDTH * TILE_SIZE;
        const dungeonPixelHeight = HEIGHT * TILE_SIZE;

        const offsetX = (screenWidth - dungeonPixelWidth) / 2;
        const offsetY = (screenHeight - dungeonPixelHeight) / 2;

        this.mesh.position.x = offsetX + this.coords.x * TILE_SIZE + TILE_SIZE / 2;
        this.mesh.position.y = screenHeight - (offsetY + this.coords.y * TILE_SIZE + TILE_SIZE / 2);
    }

    setPosition(x, y) {
        this.coords.set(x, y);
        this.updateMeshPosition();
    }
}