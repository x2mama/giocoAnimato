/**
 * Arma a terra o equipaggiata sul personaggio.
 * Con E il giocatore la raccoglie se è abbastanza vicino.
 */
class Weapon {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 36;
    this.height = 12;
    this.pickupRange = 55;
    this.pickedUp = false;
    this.owner = null;
  }

  /** Distanza tra i centri del player e dell'arma (per il pickup). */
  distanceToPlayer(player) {
    const weaponCenterX = this.x + this.width / 2;
    const weaponCenterY = this.y + this.height / 2;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const dx = weaponCenterX - playerCenterX;
    const dy = weaponCenterY - playerCenterY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  isNearPlayer(player) {
    return !this.pickedUp && this.distanceToPlayer(player) <= this.pickupRange;
  }

  /** Punto di partenza del proiettile (busto / impugnatura). */
  getFireOrigin(player) {
    return {
      x: player.x + player.width * 0.55,
      y: player.y + player.height * 0.45
    };
  }

  pickup(player) {
    if (this.pickedUp) {
      return false;
    }

    this.pickedUp = true;
    this.owner = player;
    player.equippedWeapon = this;
    return true;
  }

  /** Disegna l'arma sul terreno (prima del pickup). */
  drawOnGround(context) {
    if (this.pickedUp) {
      return;
    }

    context.save();
    context.translate(this.x, this.y);
    this._drawWeaponShape(context, false);
    context.restore();

    context.fillStyle = "rgba(255, 255, 255, 0.7)";
    context.font = "11px sans-serif";
    context.fillText("E", this.x + this.width / 2 - 4, this.y - 6);
  }

  /**
   * Disegna l'arma ancorata al busto del personaggio.
   * flipped = true quando il personaggio guarda a sinistra.
   */
  drawAttached(context, player) {
    if (!this.pickedUp || this.owner !== player) {
      return;
    }

    const torsoX = player.x + player.width * 0.55;
    const torsoY = player.y + player.height * 0.45;

    context.save();
    context.translate(torsoX, torsoY);

    if (player.flipped) {
      context.scale(-1, 1);
    }

    this._drawWeaponShape(context, true);
    context.restore();
  }

  _drawWeaponShape(context, attached) {
    const gunLength = attached ? 32 : this.width;
    const gunHeight = attached ? 10 : this.height;

    context.fillStyle = "#444";
    context.fillRect(0, -gunHeight / 2, gunLength * 0.65, gunHeight);

    context.fillStyle = "#222";
    context.fillRect(gunLength * 0.65, -gunHeight / 2, gunLength * 0.35, gunHeight * 0.7);

    context.fillStyle = "#666";
    context.fillRect(gunLength * 0.2, gunHeight / 2, gunLength * 0.15, gunHeight * 0.8);
  }
}
