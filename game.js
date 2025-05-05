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

let player,
  cursors,
  bullets,
  spaceKey,
  enemies,
  score = 0,
  scoreText;
let health = 3;
let healthText;
let gameOver = false;
let restartButton;
let background;

function preload() {
  // You can replace this with your own spaceship sprite later
  this.load.image("ship", "https://labs.phaser.io/assets/sprites/player.png");
  this.load.image("bullet", "https://labs.phaser.io/assets/sprites/bullet.png");
  this.load.image("enemy", "https://labs.phaser.io/assets/sprites/ufo.png");
  this.load.image("bg", "background.png");
}

function create() {
  background = this.add
    .image(0, 0, "bg")
    .setOrigin(0)
    .setDisplaySize(config.width, config.height);
  background.setDepth(-1);

  this.scale.on("resize", (gameSize) => {
    const width = gameSize.width;
    const height = gameSize.height;
    background.setDisplaySize(width, height);
  });

  player = this.physics.add.image(400, 500, "ship");
  player.setScale(3);
  player.body.setSize(player.width * 3, player.height * 3);
  player.setCollideWorldBounds(true);
  enemies = this.physics.add.group();

  window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });

  cursors = this.input.keyboard.createCursorKeys();

  bullets = this.physics.add.group({
    defaultKey: "bullet",
    maxSize: 50,
  });
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  this.time.addEvent({
    delay: 1000, // spawn every 1 sec
    callback: spawnEnemy,
    callbackScope: this,
    loop: true,
  });
  this.physics.add.overlap(bullets, enemies, handleHit, null, this);

  scoreText = this.add.text(20, 20, "Score: 0", {
    fontSize: "24px",
    fill: "#ffffff",
  });

  healthText = this.add.text(20, 50, "Health: 3", {
    fontSize: "24px",
    fill: "#ff4444",
  });

  this.physics.add.overlap(player, enemies, hitPlayer, null, this);

  restartButton = this.add
    .text(config.width / 2, config.height / 2, "RESTART", {
      fontSize: "32px",
      fill: "#00ff00",
      backgroundColor: "#000000",
      padding: { x: 20, y: 10 },
    })
    .setOrigin(0.5)
    .setInteractive()
    .setVisible(false); // hide initially

  restartButton.on("pointerdown", () => {
    this.scene.restart(); // restart the whole scene
  });
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

  enemies.children.each((enemy) => {
    if (enemy.active && enemy.y > config.height) {
      enemy.destroy();
    }
  });
}

function spawnEnemy() {
  const x = Phaser.Math.Between(50, config.width - 50);
  const enemy = enemies.create(x, 0, "enemy");
  enemy.setVelocityY(100); // move downward
  enemy.setScale(1.5);
}

function handleHit(bullet, enemy) {
  bullets.killAndHide(bullet);
  bullet.body.setVelocity(0);

  // 💥 Add flash effect
  enemy.setTint(0xffaaaa);
  this.time.delayedCall(100, () => {
    enemy.clearTint();
    enemy.destroy();
  });

  score += 10;
  scoreText.setText("Score: " + score);
}

function hitPlayer(player, enemy) {
  enemy.destroy();
  this.cameras.main.shake(200, 0.01); // (duration, intensity)

  if (gameOver) return;

  health--;
  healthText.setText("Health: " + health);

  if (health <= 0) {
    player.setTint(0xff0000);
    player.setVelocity(0);
    gameOver = true;

    scoreText.setText("GAME OVER! Final Score: " + score);
    healthText.setText("Health: 0");

    enemies.children.each((e) => e.setVelocity(0));

    restartButton.setVisible(true); // ✅ Show restart button
  }
}
