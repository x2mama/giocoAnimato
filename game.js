/**
 * Classe principale: collega mondo, player, armi, input e area di gioco.
 */
class Game {
  constructor() {
    this.world = new World(2500, 1800);
    this.gameArea = new GameArea("gameContainer", 800, 600);
    this.player = new Player(200, 200, 60, 60, running);
    this.inputController = new InputController(this.player);
    this.hud = new Hud("monsterCounter", "deathMessage");
    this.weapons = this._createWeapons();
    this.monsters = this._createMonsters();
    this.bullets = [];
    this.fireCooldown = 0;
    this.fireCooldownMax = 12;
    this.playerDead = false;

    this.hud.updateMonsterCount(this.countAliveMonsters());
  }

  _createMonsters() {
    const spawnPoints = [
      [400, 200], [700, 150], [1000, 280], [1350, 180], [1700, 250],
      [2050, 320], [2300, 500], [2200, 850], [2000, 1200], [2150, 1550],
      [1800, 1650], [1400, 1500], [1000, 1650], [600, 1550], [300, 1400],
      [150, 1000], [250, 600], [500, 450], [850, 700], [1200, 550],
      [1550, 650], [1850, 900], [1100, 1000], [750, 1100], [450, 850],
      [1600, 1100], [1900, 550], [600, 300], [950, 1350], [1300, 1250]
    ];

    return spawnPoints.map(
      ([x, y]) => new Monster(x, y, 55, 55, monsterSprites)
    );
  }

  _createWeapons() {
    return [
      new Weapon(400, 350),
      new Weapon(950, 550),
      new Weapon(1450, 400),
      new Weapon(600, 950),
      new Weapon(1700, 1000),
      new Weapon(2100, 700)
    ];
  }

  countAliveMonsters() {
    let count = 0;
    for (const monster of this.monsters) {
      if (monster.alive) {
        count++;
      }
    }
    return count;
  }

  start() {
    this.inputController.setupControls();
    this.inputController.onInteract = () => this.tryPickupWeapon();
    this.inputController.setupMouseShoot(this.gameArea.canvas, (screenX, screenY) => {
      this.tryShoot(screenX, screenY);
    });
    this.gameArea.start(() => this.update());
  }

  stop() {
    this.gameArea.stop();
  }

  update() {
    const collisionBoxes = this.world.getAllCollisionBoxes();

    if (!this.playerDead) {
      if (this.fireCooldown > 0) {
        this.fireCooldown--;
      }

      this.player.update(this.world.width, this.world.height, collisionBoxes);

      for (const monster of this.monsters) {
        monster.update(
          this.player,
          this.world.width,
          this.world.height,
          collisionBoxes
        );
      }

      this._updateBullets(collisionBoxes);
      this._checkPlayerDeath();
    }

    this.gameArea.updateCamera(this.player, this.world.width, this.world.height);

    this.gameArea.clear();
    this.gameArea.drawWorld(this.world);
    this.gameArea.drawWeaponsOnGround(this.weapons);

    for (const monster of this.monsters) {
      if (monster.alive) {
        this.gameArea.drawImage(monster);
      }
    }

    this.gameArea.drawBullets(this.bullets);
    this.gameArea.drawImage(this.player);

    if (this.player.equippedWeapon) {
      this.gameArea.drawWeaponAttached(this.player.equippedWeapon, this.player);
    }
  }

  _checkPlayerDeath() {
    if (this.playerDead) {
      return;
    }

    for (const monster of this.monsters) {
      if (monster.alive && monster.touchesPlayer(this.player)) {
        this.playerDead = true;
        this.player.setSpeed(0, 0);
        this.hud.showDeathMessage();
        return;
      }
    }
  }

  _updateBullets(collisionBoxes) {
    for (const bullet of this.bullets) {
      bullet.update(this.world.width, this.world.height);

      if (!bullet.active) {
        continue;
      }

      for (const obstacle of collisionBoxes) {
        if (bullet.hitsObstacle(obstacle)) {
          bullet.active = false;
          break;
        }
      }

      if (!bullet.active) {
        continue;
      }

      for (const monster of this.monsters) {
        if (bullet.hitsMonster(monster)) {
          monster.kill();
          bullet.active = false;
          this.hud.updateMonsterCount(this.countAliveMonsters());
          break;
        }
      }
    }

    this.bullets = this.bullets.filter((bullet) => bullet.active);
  }

  tryShoot(screenX, screenY) {
    if (this.playerDead || !this.player.equippedWeapon || this.fireCooldown > 0) {
      return;
    }

    const target = this.gameArea.screenToWorld(screenX, screenY);
    const origin = this.player.equippedWeapon.getFireOrigin(this.player);

    this.bullets.push(
      new Bullet(origin.x, origin.y, target.x, target.y)
    );
    this.fireCooldown = this.fireCooldownMax;
  }

  tryPickupWeapon() {
    if (this.playerDead || this.player.equippedWeapon) {
      return;
    }

    for (const weapon of this.weapons) {
      if (weapon.isNearPlayer(this.player)) {
        weapon.pickup(this.player);
        return;
      }
    }
  }
}
