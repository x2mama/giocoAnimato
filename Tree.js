/**
 * Albero decorativo sulla mappa.
 * Il tronco può essere un ostacolo: il giocatore non passa attraverso il tronco.
 */
class Tree {
  constructor(x, y, blocksMovement = true) {
    this.x = x;
    this.y = y;
    this.trunkWidth = 18;
    this.trunkHeight = 35;
    this.crownRadius = 28;
    this.blocksMovement = blocksMovement;
  }

  /** Rettangolo di collisione solo sul tronco (non sulla chioma). */
  getCollisionBox() {
    if (!this.blocksMovement) {
      return null;
    }

    const trunkX = this.x + this.crownRadius - this.trunkWidth / 2;
    const trunkY = this.y + this.crownRadius * 2 - this.trunkHeight;

    return {
      x: trunkX,
      y: trunkY,
      width: this.trunkWidth,
      height: this.trunkHeight
    };
  }

  draw(context) {
    const centerX = this.x + this.crownRadius;
    const trunkX = centerX - this.trunkWidth / 2;
    const trunkY = this.y + this.crownRadius * 2 - this.trunkHeight;
    const crownY = this.y + this.crownRadius;

    context.fillStyle = "#4a3728";
    context.fillRect(trunkX, trunkY, this.trunkWidth, this.trunkHeight);

    context.fillStyle = "#2d6b2d";
    context.beginPath();
    context.arc(centerX, crownY, this.crownRadius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#3d8b3d";
    context.beginPath();
    context.arc(centerX - 10, crownY - 6, this.crownRadius * 0.55, 0, Math.PI * 2);
    context.fill();
  }
}
