/**
 * Gestisce input da tastiera: movimento (WASD/frecce) e interazione (E).
 */
class InputController {
  constructor(player) {
    this.player = player;
    this.controlsState = {
      left: false,
      right: false,
      up: false,
      down: false
    };
    this.onInteract = null;
  }

  setupControls() {
    window.addEventListener("keydown", (event) => this.handleKey(event, true));
    window.addEventListener("keyup", (event) => this.handleKey(event, false));
  }

  /**
   * Click sinistro sul canvas: coordinate schermo passate al callback.
   * Tiene conto del ridimensionamento CSS del canvas.
   */
  setupMouseShoot(canvas, onShoot) {
    canvas.addEventListener("mousedown", (event) => {
      if (event.button !== 0) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const screenX = (event.clientX - rect.left) * scaleX;
      const screenY = (event.clientY - rect.top) * scaleY;

      onShoot(screenX, screenY);
    });
  }

  handleKey(event, pressed) {
    const key = event.key.toLowerCase();

    if (key === "e" && pressed && this.onInteract) {
      event.preventDefault();
      this.onInteract();
      return;
    }

    const direction = this.getDirectionFromKey(key);
    if (!direction) {
      return;
    }

    event.preventDefault();
    this.controlsState[direction] = pressed;
    this.updatePlayerSpeed();
  }

  updatePlayerSpeed() {
    const speedX =
      (this.controlsState.right ? this.player.speedStep : 0) -
      (this.controlsState.left ? this.player.speedStep : 0);
    const speedY =
      (this.controlsState.down ? this.player.speedStep : 0) -
      (this.controlsState.up ? this.player.speedStep : 0);
    this.player.setSpeed(speedX, speedY);
  }

  getDirectionFromKey(key) {
    switch (key) {
      case "a":
      case "arrowleft":
        return "left";
      case "d":
      case "arrowright":
        return "right";
      case "w":
      case "arrowup":
        return "up";
      case "s":
      case "arrowdown":
        return "down";
      default:
        return null;
    }
  }
}
