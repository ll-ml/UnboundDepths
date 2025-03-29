import * as THREE from 'three';

const TILE_SIZE = 16; // TODO: Make sure its ok
const WIDTH = 40;   // columns
const HEIGHT = 30;  // rows

export class DungeonObject {
    constructor(texturePath, x, y) {
        const textureLoader = new THREE.TextureLoader();
        const objectTexture = textureLoader.load(texturePath);

        objectTexture.colorSpace = THREE.SRGBColorSpace;

        const materal = new THREE.MeshBasicMaterial({ map: objectTexture });
        const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);

        this.mesh = new THREE.Mesh(geometry, materal);
        //this.mesh.material.depthTest = false;
        //this.mesh.renderOrder = 999; keepin these around for now 
        this.mesh.material.transparent = true; // This is what works well for the rendering ontop right now

        this.coords = new THREE.Vector2(x, y); // Naming issues with coords vs position

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