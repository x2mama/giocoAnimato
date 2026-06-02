/**
 * Personaggio controllabile: movimento, animazione sprite, collisioni.
 */
class Player {
  constructor(x, y, width, height, spriteList) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.speedStep = 3;
    this.flipped = false;
    this.imageList = [];
    this.image = null;
    this.contaFrame = 0;
    this.actualFrame = 0;
    this.frameDelay = 8;
    this.equippedWeapon = null;

    this.loadImages(spriteList);
  }

  loadImages(spriteList) {
    for (const imgPath of spriteList) {
      const img = new Image();
      img.src = imgPath;
      this.imageList.push(img);
    }

    this.image = this.imageList[this.actualFrame];
  }

  /**
   * Aggiorna posizione e animazione.
   * worldWidth/Height = limiti della mappa.
   * collisionBoxes = array di rettangoli {x,y,width,height} da World.
   */
  update(worldWidth, worldHeight, collisionBoxes) {
    const oldX = this.x;
    const oldY = this.y;

    this.x += this.speedX;
    this.y += this.speedY;

    if (this._hitsAnyObstacle(collisionBoxes)) {
      this.x = oldX;
      this.y = oldY;
    }

    this._clampToWorld(worldWidth, worldHeight);

    if (this.speedX < 0) {
      this.flipped = true;
    } else if (this.speedX > 0) {
      this.flipped = false;
    }

    this._updateAnimation(oldX, oldY);
  }

  _hitsAnyObstacle(collisionBoxes) {
    const playerBox = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };

    for (const box of collisionBoxes) {
      if (this._rectsOverlap(playerBox, box)) {
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

  _updateAnimation(oldX, oldY) {
    const isMoving = this.x !== oldX || this.y !== oldY;

    if (!isMoving) {
      this.contaFrame = 0;
      this.actualFrame = 0;
      this.image = this.imageList[this.actualFrame];
      return;
    }

    this.contaFrame++;
    if (this.contaFrame >= this.frameDelay) {
      this.contaFrame = 0;
      this.actualFrame = (1 + this.actualFrame) % this.imageList.length;
      this.image = this.imageList[this.actualFrame];
    }
  }

  setSpeed(speedX, speedY) {
    this.speedX = speedX;
    this.speedY = speedY;
  }

  getCenterX() {
    return this.x + this.width / 2;
  }

  getCenterY() {
    return this.y + this.height / 2;
  }
}
