/**
 * Ostacolo: rettangolo solido che il giocatore non può attraversare.
 * Usiamo le coordinate (x, y) come angolo in alto a sinistra.
 */
class Obstacle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * Controlla se due rettangoli si sovrappongono (collisione AABB).
   * Serve al Player per capire se può muoversi o deve tornare indietro.
   */
  collidesWith(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  draw(context) {
    context.fillStyle = "#5c4033";
    context.fillRect(this.x, this.y, this.width, this.height);
    context.strokeStyle = "#3e2a1f";
    context.lineWidth = 2;
    context.strokeRect(this.x, this.y, this.width, this.height);
  }
}
