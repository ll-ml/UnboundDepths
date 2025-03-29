import * as THREE from 'three';
import { Dungeon } from './dungeon.js';
import { TickManager } from './tickManager.js';


const WIDTH = 40;   // columns
const HEIGHT = 30;  // rows
const TILE_SIZE = 16;

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

const pixelWidth = TILE_SIZE * WIDTH;
const pixelHeight = TILE_SIZE * HEIGHT;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x222222, 1)
document.body.appendChild(renderer.domElement);

// Orthographic camera: top-left is (0, 0)
const camera = new THREE.OrthographicCamera(
  0,
  window.innerWidth,
  window.innerHeight,
  0,
  -100,
  100
);
camera.position.set(0, 0, 10);
camera.zoom = Math.min(screenWidth / pixelWidth, screenHeight / pixelHeight);
camera.updateProjectionMatrix();
camera.lookAt(0, 0, 0);

const dungeon = new Dungeon(WIDTH, HEIGHT);
dungeon.generateDungeon();

const tickManager = new TickManager(600);

tickManager.onTick(() => {
  dungeon.updateEnemies(scene);
});

const fallbackMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

function renderSparseObjects() {
  for (const obj of dungeon.sparseMatrix) {
    if (obj && obj.mesh) {
      scene.add(obj.mesh);
    }
  }
}

function getWallMaterial(wallMaterials) {
  const roll = Math.random();
  if (roll < 0.78) {
    return wallMaterials[0];
  } else if (roll < 0.98) {
    return wallMaterials[1];
  } else {
    if (wallMaterials.length > 2) {
      const rareIndex = Math.floor(Math.random() * (wallMaterials.length - 2)) + 2;
      return wallMaterials[rareIndex];
    } else {
      return wallMaterials[1];
    }
  }
}

function buildDungeon() {
  // clear previous
  while (scene.children.length) {
    scene.remove(scene.children[0]);
  }

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Dungeon size in pixels
  const dungeonPixelWidth = WIDTH * TILE_SIZE;
  const dungeonPixelHeight = HEIGHT * TILE_SIZE;

  // offsets
  const offsetX = (screenWidth - dungeonPixelWidth) / 2;
  const offsetY = (screenHeight - dungeonPixelHeight) / 2;

  const tileGeometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const tile = dungeon.denseMatrix[y][x];
      let material = dungeon.materialMap[tile] || fallbackMaterial;

      if (Array.isArray(material)) {
        material = getWallMaterial(material);
      }

      const mesh = new THREE.Mesh(tileGeometry, material);
      mesh.position.x = offsetX + x * TILE_SIZE + TILE_SIZE / 2;
      mesh.position.y = screenHeight - (offsetY + y * TILE_SIZE + TILE_SIZE / 2);
      scene.add(mesh);
    }
  }

  renderSparseObjects();
}

// Render loop
let lastTime = performance.now();
function animate(currentTime) {
  requestAnimationFrame(animate);
  
  const delta = currentTime - lastTime;
  lastTime = currentTime;

  tickManager.update(delta);

  renderer.render(scene, camera);
}

buildDungeon();
requestAnimationFrame(animate);

// TODO: Fix
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.right = window.innerWidth;
  camera.top = window.innerHeight;
  camera.updateProjectionMatrix();
  buildDungeon();
});


let player = dungeon.player;

// can move this around later
function updateInventoryDisplay() {
  const inventoryDiv = document.getElementById('inventoryItems');
  inventoryDiv.innerHTML = '';

  player.inventory.forEach(item => {
    const img = document.createElement('img');
    img.src = item.imagePath;
    img.style.width = '50px';
    img.style.height = '50px';
    img.style.margin = '5px';
    img.style.imageRendering = 'pixelated';
    img.style.imageRendering = 'crisp-edges';

    img.alt = item.name;
    img.title = item.description;
    inventoryDiv.appendChild(img);

  });
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.key === ' ') {
    if (player && player.isAdjacentToPool(dungeon.denseMatrix, dungeon.sparseMatrix)) {
      //dungeon.addStatus("You search the oasis... Nothing interesting happens.")
      dungeon.addStatus("You manage to pull something out of the clear blue water...");
      player.addTestItem();
      updateInventoryDisplay();
      // call player.interact();
    }
  }
  if (event.key === 'Enter') {
    dungeon.generateDungeon();
    buildDungeon();
    player = dungeon.player;
    updateInventoryDisplay();
    //dungeon.showCurrentState();
    return;
  }
  let direction = new THREE.Vector2(0, 0);
  switch (event.key.toLowerCase()) {
    case 'w':
      direction.set(0, -1);
      break;
    case 's':
      direction.set(0, 1);
      break;
    case 'a':
      direction.set(-1, 0);
      break;
    case 'd':
      direction.set(1, 0);
      break
  }

  if (direction.lengthSq() > 0) {
    player.setDesiredMove(direction, dungeon.denseMatrix);
    player.applyMove();
  }
});