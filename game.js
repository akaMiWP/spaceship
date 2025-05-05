const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);

let player;
let cursors;
let bullets;
let spaceKey;

function preload() {
  // You can replace this with your own spaceship sprite later
  this.load.image("ship", "https://labs.phaser.io/assets/sprites/player.png");
  this.load.image("bullet", "https://labs.phaser.io/assets/sprites/bullet.png");
}

function create() {
  player = this.physics.add.image(400, 500, "ship");
  player.setScale(3);
  player.body.setSize(player.width * 3, player.height * 3);
  player.setCollideWorldBounds(true);

  window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });

  cursors = this.input.keyboard.createCursorKeys();

  bullets = this.physics.add.group({
    defaultKey: "bullet",
    maxSize: 50,
  });
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function update() {
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    player.setVelocityY(200);
  }

  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    let bullet = bullets.get(player.x, player.y - 20);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.velocity.y = -300; // shoot upward
    }
  }
}
