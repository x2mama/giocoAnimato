class Game {
  constructor(spriteList) {
    this.gameArea = new GameArea("gameContainer");
    this.world = new World({ seed: 1337, tileSize: 32, chunkSize: 16 });
    const spawnPoint = this.world.findSpawnPoint(60, 60);
    this.player = new Player(spawnPoint.x, spawnPoint.y, 60, 60, spriteList);
    this.inputController = new InputController(this.player);
    this.camera = {
      x: 0,
      y: 0
    };
  }

  start() {
    this.inputController.setupControls();
    this.gameArea.start(() => this.update());
    this.updateCamera();
  }

  stop() {
    this.gameArea.stop();
  }

  update() {
    this.player.update(this.world);
    this.updateCamera();

    this.gameArea.clear();
    this.gameArea.drawWorld(this.world, this.camera);
    this.gameArea.drawImage(this.player, this.camera);
  }

  updateCamera() {
    const canvasWidth = this.gameArea.canvas.width;
    const canvasHeight = this.gameArea.canvas.height;
    const deadZoneWidth = canvasWidth * 0.34;
    const deadZoneHeight = canvasHeight * 0.30;
    const leftBound = this.camera.x + (canvasWidth - deadZoneWidth) / 2;
    const rightBound = leftBound + deadZoneWidth;
    const topBound = this.camera.y + (canvasHeight - deadZoneHeight) / 2;
    const bottomBound = topBound + deadZoneHeight;
    const playerCenterX = this.player.x + (this.player.width / 2);
    const playerCenterY = this.player.y + (this.player.height / 2);

    if (playerCenterX < leftBound) {
      this.camera.x = playerCenterX - (canvasWidth - deadZoneWidth) / 2;
    } else if (playerCenterX > rightBound) {
      this.camera.x = playerCenterX - (canvasWidth + deadZoneWidth) / 2;
    }

    if (playerCenterY < topBound) {
      this.camera.y = playerCenterY - (canvasHeight - deadZoneHeight) / 2;
    } else if (playerCenterY > bottomBound) {
      this.camera.y = playerCenterY - (canvasHeight + deadZoneHeight) / 2;
    }
  }
}
