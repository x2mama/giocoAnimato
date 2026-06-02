/**
 * Nemico che insegue il giocatore (stile zombie).
 * Velocità inferiore al Player; animazione come il personaggio.
 */
class Monster {
  constructor(x, y, width, height, spriteList) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedStep = 1.6;
    this.flipped = false;
    this.imageList = [];
    this.image = null;
    this.contaFrame = 0;
    this.actualFrame = 0;
    this.frameDelay = 8;
    this.runFrameCount = spriteList.length - 1;
    this.idleFrameIndex = spriteList.length - 1;
    this.alive = true;

    this.loadImages(spriteList);
  }

  loadImages(spriteList) {
    for (const imgPath of spriteList) {
      const img = new Image();
      img.src = imgPath;
      this.imageList.push(img);
    }

    this.image = this.imageList[0];
  }

  /**
   * Si muove verso il centro del player.
   * La direzione è normalizzata così la velocità è costante su ogni asse.
   */
  update(player, worldWidth, worldHeight, collisionBoxes) {
    if (!this.alive) {
      return;
    }

    const oldX = this.x;
    const oldY = this.y;

    const dx = player.getCenterX() - this.getCenterX();
    const dy = player.getCenterY() - this.getCenterY();
    const distance = Math.sqrt(dx * dx + dy * dy);
    const isTouchingPlayer = this.touchesPlayer(player);

    // Inseguono sempre il player, senza raggio visivo o soglia di attivazione.
    if (!isTouchingPlayer && distance > 0) {
      const dirX = dx / distance;
      const dirY = dy / distance;

      this.x += dirX * this.speedStep;
      this.y += dirY * this.speedStep;

      if (this._hitsAnyObstacle(collisionBoxes)) {
        this.x = oldX;
        this.y = oldY;
      }

      this._clampToWorld(worldWidth, worldHeight);

      if (dirX < 0) {
        this.flipped = true;
      } else if (dirX > 0) {
        this.flipped = false;
      }
    }

    this._updateAnimation(oldX, oldY, !isTouchingPlayer);
  }

  _hitsAnyObstacle(collisionBoxes) {
    const box = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };

    for (const obstacle of collisionBoxes) {
      if (this._rectsOverlap(box, obstacle)) {
        return true;
      }
    }

    return false;
  }

  _rectsOverlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  _clampToWorld(worldWidth, worldHeight) {
    const maxX = worldWidth - this.width;
    const maxY = worldHeight - this.height;
    this.x = Math.max(0, Math.min(this.x, maxX));
    this.y = Math.max(0, Math.min(this.y, maxY));
  }

  _updateAnimation(oldX, oldY, isChasing) {
    const isMoving = this.x !== oldX || this.y !== oldY;

    if (!isMoving || !isChasing) {
      this.contaFrame = 0;
      this.actualFrame = this.idleFrameIndex;
      this.image = this.imageList[this.actualFrame];
      return;
    }

    this.contaFrame++;
    if (this.contaFrame >= this.frameDelay) {
      this.contaFrame = 0;
      this.actualFrame = (this.actualFrame + 1) % this.runFrameCount;
      this.image = this.imageList[this.actualFrame];
    }
  }

  getCenterX() {
    return this.x + this.width / 2;
  }

  getCenterY() {
    return this.y + this.height / 2;
  }

  kill() {
    this.alive = false;
  }

  touchesPlayer(player) {
    return this._rectsOverlap(
      { x: this.x, y: this.y, width: this.width, height: this.height },
      { x: player.x, y: player.y, width: player.width, height: player.height }
    );
  }
}
