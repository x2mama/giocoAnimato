class GameArea {
  constructor(containerId) {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    
    this.containerId = containerId;
    this.interval = null;
    this.resizeHandler = null;
  }

  start(updateCallback) {
    document.getElementById(this.containerId).appendChild(this.canvas);
    this.resizeCanvas();
    this.resizeHandler = () => this.resizeCanvas();
    window.addEventListener("resize", this.resizeHandler);
    this.interval = setInterval(updateCallback, 20); // 50 FPS
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawImage(component, camera = { x: 0, y: 0 }) {
    if (component.image) {
      const drawX = component.x - camera.x;
      const drawY = component.y - camera.y;

      if (component.flipped) {
        // Salva lo stato del contesto
        this.context.save();
        // Trasla e scala per specchiare orizzontalmente
        this.context.translate(drawX + component.width, drawY);
        this.context.scale(-1, 1);
        this.context.drawImage(component.image, 0, 0, component.width, component.height);
        // Ripristina lo stato del contesto
        this.context.restore();
      } else {
        this.context.drawImage(component.image, drawX, drawY, component.width, component.height);
      }
    }
  }

  drawTile(tile, camera, tileSize) {
    const x = tile.x * tileSize - camera.x;
    const y = tile.y * tileSize - camera.y;

    this.context.fillStyle = tile.color;
    this.context.fillRect(x, y, tileSize, tileSize);

    if (tile.overlay) {
      this.context.fillStyle = tile.overlay;
      this.context.fillRect(x, y, tileSize, tileSize);
    }

    if (tile.decor === "tree") {
      this.drawTree(x, y, tileSize);
    }

    if (tile.decor === "rock") {
      this.drawRock(x, y, tileSize);
    }
  }

  drawTree(x, y, tileSize) {
    const trunkWidth = Math.max(4, Math.floor(tileSize * 0.18));
    const trunkHeight = Math.max(10, Math.floor(tileSize * 0.34));
    const trunkX = x + Math.floor((tileSize - trunkWidth) / 2);
    const trunkY = y + tileSize - trunkHeight;

    this.context.fillStyle = "#7b4a2f";
    this.context.fillRect(trunkX, trunkY, trunkWidth, trunkHeight);

    this.context.fillStyle = "#1f7a3f";
    this.context.beginPath();
    this.context.arc(x + tileSize / 2, y + tileSize * 0.38, tileSize * 0.24, 0, Math.PI * 2);
    this.context.arc(x + tileSize * 0.36, y + tileSize * 0.52, tileSize * 0.18, 0, Math.PI * 2);
    this.context.arc(x + tileSize * 0.64, y + tileSize * 0.52, tileSize * 0.18, 0, Math.PI * 2);
    this.context.fill();
  }

  drawRock(x, y, tileSize) {
    this.context.fillStyle = "#6b7280";
    this.context.beginPath();
    this.context.arc(x + tileSize * 0.45, y + tileSize * 0.58, tileSize * 0.18, 0, Math.PI * 2);
    this.context.arc(x + tileSize * 0.6, y + tileSize * 0.66, tileSize * 0.12, 0, Math.PI * 2);
    this.context.fill();
  }

  drawWorld(world, camera) {
    const tileSize = world.tileSize;
    const startTileX = Math.floor(camera.x / tileSize) - 1;
    const startTileY = Math.floor(camera.y / tileSize) - 1;
    const endTileX = Math.ceil((camera.x + this.canvas.width) / tileSize) + 1;
    const endTileY = Math.ceil((camera.y + this.canvas.height) / tileSize) + 1;

    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        const tile = world.getTile(tileX, tileY);
        this.drawTile(tile, camera, tileSize);
      }
    }
  }
}
