/**
 * Mondo di gioco: sfondo verde, alberi e ostacoli.
 * Le dimensioni (width, height) sono più grandi del canvas visibile:
 * il giocatore si muove nella mappa e la camera lo segue.
 */
class World {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.trees = [];
    this.obstacles = [];
    this._buildMap();
  }

  _buildMap() {
    const treePositions = [
      [120, 80], [350, 150], [600, 90], [900, 200], [1150, 120],
      [1400, 280], [1800, 100], [2100, 350], [400, 450], [750, 520],
      [1100, 600], [1500, 480], [1900, 650], [2200, 800], [200, 750],
      [550, 900], [1000, 850], [1350, 950], [1750, 1100], [2150, 1050],
      [300, 1200], [800, 1300], [1250, 1250], [1700, 1400], [2050, 1350],
      [450, 1550], [950, 1600], [1400, 1700], [1850, 1550], [2300, 1650]
    ];

    for (const [tx, ty] of treePositions) {
      this.trees.push(new Tree(tx, ty, true));
    }

    this.obstacles.push(
      new Obstacle(500, 300, 120, 40),
      new Obstacle(850, 400, 80, 120),
      new Obstacle(1200, 250, 150, 50),
      new Obstacle(1600, 500, 60, 180),
      new Obstacle(700, 700, 200, 45),
      new Obstacle(1300, 750, 90, 90),
      new Obstacle(1900, 400, 140, 60),
      new Obstacle(400, 1000, 100, 100),
      new Obstacle(1000, 1100, 180, 50),
      new Obstacle(1800, 900, 70, 150),
      new Obstacle(2200, 500, 100, 80)
    );
  }

  /** Tutti i rettangoli con cui il player può collidere. */
  getAllCollisionBoxes() {
    const boxes = [];

    for (const obstacle of this.obstacles) {
      boxes.push(obstacle);
    }

    for (const tree of this.trees) {
      const box = tree.getCollisionBox();
      if (box) {
        boxes.push(box);
      }
    }

    return boxes;
  }

  draw(context) {
    context.fillStyle = "#5cb85c";
    context.fillRect(0, 0, this.width, this.height);

    context.fillStyle = "#4cae4c";
    for (let gx = 0; gx < this.width; gx += 80) {
      for (let gy = 0; gy < this.height; gy += 80) {
        if ((gx / 80 + gy / 80) % 2 === 0) {
          context.fillRect(gx, gy, 40, 40);
        }
      }
    }

    for (const tree of this.trees) {
      tree.draw(context);
    }

    for (const obstacle of this.obstacles) {
      obstacle.draw(context);
    }
  }
}
