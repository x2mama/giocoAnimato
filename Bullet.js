/**
 * Proiettile che viaggia in linea retta verso un punto del mondo (es. cursore).
 */
class Bullet {
  constructor(startX, startY, targetX, targetY) {
    this.x = startX;
    this.y = startY;
    this.radius = 5;
    this.speed = 14;
    this.active = true;
    this.lifetime = 90;

    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    this.dirX = dx / distance;
    this.dirY = dy / distance;
  }

  update(worldWidth, worldHeight) {
    if (!this.active) {
      return;
    }

    this.x += this.dirX * this.speed;
    this.y += this.dirY * this.speed;
    this.lifetime--;

    if (this.lifetime <= 0) {
      this.active = false;
      return;
    }

    if (
      this.x < 0 ||
      this.y < 0 ||
      this.x > worldWidth ||
      this.y > worldHeight
    ) {
      this.active = false;
    }
  }

  hitsObstacle(obstacle) {
    return this._circleIntersectsRect(
      this.x,
      this.y,
      this.radius,
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    );
  }

  hitsMonster(monster) {
    if (!monster.alive) {
      return false;
    }

    return this._circleIntersectsRect(
      this.x,
      this.y,
      this.radius,
      monster.x,
      monster.y,
      monster.width,
      monster.height
    );
  }

  _circleIntersectsRect(cx, cy, radius, rx, ry, rw, rh) {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy <= radius * radius;
  }

  draw(context) {
    if (!this.active) {
      return;
    }

    context.fillStyle = "#ffeb3b";
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "#f9a825";
    context.lineWidth = 2;
    context.stroke();
  }
}
