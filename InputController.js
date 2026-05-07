class InputController {
  constructor(player) {
    this.player = player;
    this.controlsState = {
      left: false,
      right: false,
      up: false,
      down: false
    };

    this.keyboardBound = false;
  }

  setControlDirection(direction, pressed) {
    this.controlsState[direction] = pressed;
    this.updatePlayerSpeed();
  }

  updatePlayerSpeed() {
    const speedX = (this.controlsState.right ? this.player.speedStep : 0) - 
                   (this.controlsState.left ? this.player.speedStep : 0);
    const speedY = (this.controlsState.down ? this.player.speedStep : 0) - 
                   (this.controlsState.up ? this.player.speedStep : 0);
    
    this.player.setSpeed(speedX, speedY);
  }

  setupControls() {
    this.wireControl("btnLeft", "left");
    this.wireControl("btnRight", "right");
    this.wireControl("btnUp", "up");
    this.wireControl("btnDown", "down");

    if (!this.keyboardBound) {
      this.setupKeyboardControls();
      this.keyboardBound = true;
    }
  }

  setupKeyboardControls() {
    window.addEventListener("keydown", (event) => {
      const direction = this.getDirectionFromKey(event.key);
      if (!direction) {
        return;
      }

      event.preventDefault();
      this.setControlDirection(direction, true);
    });

    window.addEventListener("keyup", (event) => {
      const direction = this.getDirectionFromKey(event.key);
      if (!direction) {
        return;
      }

      event.preventDefault();
      this.setControlDirection(direction, false);
    });
  }

  getDirectionFromKey(key) {
    switch (key.toLowerCase()) {
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

  wireControl(buttonId, direction) {
    const button = document.getElementById(buttonId);
    if (!button) {
      return;
    }

    const handlePress = () => this.setControlDirection(direction, true);
    const handleRelease = () => this.setControlDirection(direction, false);

    // Mouse events
    button.addEventListener("mousedown", handlePress);
    button.addEventListener("mouseup", handleRelease);
    button.addEventListener("mouseleave", handleRelease);

    // Touch events
    button.addEventListener("touchstart", (event) => {
      event.preventDefault();
      handlePress();
    }, { passive: false });
    button.addEventListener("touchend", handleRelease);
    button.addEventListener("touchcancel", handleRelease);
  }
}
