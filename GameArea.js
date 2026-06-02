/**
 * Area di gioco: canvas, ciclo di disegno e camera che segue il player.
 */
class GameArea {
  constructor(containerId, width = 800, height = 600) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext("2d");
    this.containerId = containerId;
    this.interval = null;
    this.cameraX = 0;
    this.cameraY = 0;
  }

  start(updateCallback) {
    document.getElementById(this.containerId).appendChild(this.canvas);
    this.interval = setInterval(updateCallback, 20);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Centra la camera sul player, senza uscire dai bordi della mappa.
   */
  updateCamera(player, worldWidth, worldHeight) {
    this.cameraX = player.getCenterX() - this.canvas.width / 2;
    this.cameraY = player.getCenterY() - this.canvas.height / 2;

    const maxCameraX = worldWidth - this.canvas.width;
    const maxCameraY = worldHeight - this.canvas.height;

    this.cameraX = Math.max(0, Math.min(this.cameraX, maxCameraX));
    this.cameraY = Math.max(0, Math.min(this.cameraY, maxCameraY));
  }

  clear() {
    this.context.fillStyle = "#87ceeb";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** Disegna tutto ciò che sta nel mondo (con offset camera). */
  drawWorld(world) {
    this.context.save();
    this.context.translate(-this.cameraX, -this.cameraY);
    world.draw(this.context);
    this.context.restore();
  }

  drawWeaponsOnGround(weapons) {
    this.context.save();
    this.context.translate(-this.cameraX, -this.cameraY);
    for (const weapon of weapons) {
      weapon.drawOnGround(this.context);
    }
    this.context.restore();
  }

  drawImage(component) {
    if (!component.image) {
      return;
    }

    const screenX = component.x - this.cameraX;
    const screenY = component.y - this.cameraY;

    if (component.flipped) {
      this.context.save();
      this.context.translate(screenX + component.width, screenY);
      this.context.scale(-1, 1);
      this.context.drawImage(component.image, 0, 0, component.width, component.height);
      this.context.restore();
      return;
    }

    this.context.drawImage(
      component.image,
      screenX,
      screenY,
      component.width,
      component.height
    );
  }

  drawWeaponAttached(weapon, player) {
    this.context.save();
    this.context.translate(-this.cameraX, -this.cameraY);
    weapon.drawAttached(this.context, player);
    this.context.restore();
  }

  drawBullets(bullets) {
    this.context.save();
    this.context.translate(-this.cameraX, -this.cameraY);
    for (const bullet of bullets) {
      bullet.draw(this.context);
    }
    this.context.restore();
  }

  /** Converte coordinate schermo (mouse sul canvas) in coordinate mondo. */
  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.cameraX,
      y: screenY + this.cameraY
    };
  }
}
