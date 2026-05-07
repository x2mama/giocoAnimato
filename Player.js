class Player {
  constructor(x, y, width, height, spriteList) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    this.speedX = 0;
    this.speedY = 0;
    this.speedStep = 2;
    
    this.flipped = false;
    
    this.imageList = [];
    this.image = null;
    this.contaFrame = 0;
    this.actualFrame = 0;
    this.frameDelay = 8;
    
    this.loadImages(spriteList);
  }

  loadImages(spriteList) {
    for (const imgPath of spriteList) {
      const img = new Image(this.width, this.height);
      img.src = imgPath;
      this.imageList.push(img);
    }
    this.image = this.imageList[this.actualFrame];
  }

  update(world) {
    const oldX = this.x;
    const oldY = this.y;

    if (world) {
      world.moveEntity(this, this.speedX, this.speedY);
    } else {
      this.x += this.speedX;
      this.y += this.speedY;
    }

    // Specchia l'immagine in base alla direzione
    if (this.speedX < 0) {
      this.flipped = true;
    } else if (this.speedX > 0) {
      this.flipped = false;
    }

    const isMoving = this.x !== oldX || this.y !== oldY;

    if (!isMoving) {
      this.contaFrame = 0;
      this.actualFrame = 0;
      this.image = this.imageList[this.actualFrame];
      return;
    }

    // Animazione
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
}
