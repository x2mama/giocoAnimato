var animatedObject = {
  speedX: 0,
  speedY: 0,
  speedStep: 2,
  width: 60,
  height: 60,
  x: 10,
  y: 120,
  imageList: [], //Vettore che conterrà tutte le immagini caricate
  contaFrame: 0, //Tiene conto di quanti frame sono passati
  actualFrame: 0, //Specifica quale frame disegnare
  frameDelay: 8,

  update: function() {
    var oldX = this.x;
    var oldY = this.y;

    this.x += this.speedX;
    this.y += this.speedY;

    var maxX = myGameArea.canvas.width - this.width;
    var maxY = myGameArea.canvas.height - this.height;

    this.x = Math.max(0, Math.min(this.x, maxX));
    this.y = Math.max(0, Math.min(this.y, maxY));

    var isMoving = this.x !== oldX || this.y !== oldY;

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
  },

  loadImages: function() {
    for (var imgPath of running) {
      var img = new Image(this.width, this.height);
      img.src = imgPath;
      this.imageList.push(img);
    }
    this.image = this.imageList[this.actualFrame];
  }
};

var controlsState = {
  left: false,
  right: false,
  up: false,
  down: false,
};

function refreshSpeed() {
  animatedObject.speedX = (controlsState.right ? animatedObject.speedStep : 0) - (controlsState.left ? animatedObject.speedStep : 0);
  animatedObject.speedY = (controlsState.down ? animatedObject.speedStep : 0) - (controlsState.up ? animatedObject.speedStep : 0);
}

function setControlDirection(direction, pressed) {
  controlsState[direction] = pressed;
  refreshSpeed();
}

function wireControl(buttonId, direction) {
  var button = document.getElementById(buttonId);
  if (!button) {
    return;
  }

  button.addEventListener("mousedown", function() {
    setControlDirection(direction, true);
  });

  button.addEventListener("mouseup", function() {
    setControlDirection(direction, false);
  });

  button.addEventListener("mouseleave", function() {
    setControlDirection(direction, false);
  });

  button.addEventListener("touchstart", function(event) {
    event.preventDefault();
    setControlDirection(direction, true);
  }, { passive: false });

  button.addEventListener("touchend", function() {
    setControlDirection(direction, false);
  });

  button.addEventListener("touchcancel", function() {
    setControlDirection(direction, false);
  });
}

function setupControls() {
  wireControl("btnLeft", "left");
  wireControl("btnRight", "right");
  wireControl("btnUp", "up");
  wireControl("btnDown", "down");
}



var myGameArea = {
    canvas: document.createElement("canvas"),

    start: function () {
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");

        document.getElementById("gameContainer").appendChild(this.canvas);

        this.interval = setInterval(updateGameArea, 20); // 50 FPS
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    drawImage: function(component) {
        if (component.image) {
            this.context.drawImage(component.image, component.x, component.y, component.width, component.height);
        }
    },
};

function startGame() {
    myGameArea.start();
    animatedObject.loadImages();
    setupControls();
}

function updateGameArea() {
    animatedObject.update();
    myGameArea.clear();
    myGameArea.drawImage(animatedObject);
}