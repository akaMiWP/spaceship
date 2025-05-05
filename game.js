const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: { preload, create, update },
};

const game = new Phaser.Game(config);

// Game state variables
let player, cursors, bullets, spaceKey, enemies;
let score = 0,
  scoreText;
let health = 3,
  healthText;
let gameOver = false,
  restartButton,
  background;

function preload() {
  this.load.image("ship", "ship.png");
  this.load.image("bullet", "bullet.png");
  this.load.image("enemy", "ufo.png");
  this.load.image("bg", "background.png");
}

function create() {
  background = this.add
    .image(0, 0, "bg")
    .setOrigin(0)
    .setDisplaySize(config.width, config.height);
  background.setDepth(-1);

  this.scale.on("resize", (newSize) => {
    background.setDisplaySize(newSize.width, newSize.height);
    restartButton.setPosition(newSize.width / 2, newSize.height / 2);
  });

  player = this.physics.add.image(400, 500, "ship");
  player.setCollideWorldBounds(true);

  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  bullets = this.physics.add.group({ defaultKey: "bullet", maxSize: 200 });
  enemies = this.physics.add.group();

  this.spawnEvent = this.time.addEvent({
    delay: 1000,
    callback: spawnEnemy,
    callbackScope: this,
    loop: true,
  });

  this.physics.add.overlap(bullets, enemies, handleHit, null, this);
  this.physics.add.overlap(player, enemies, hitPlayer, null, this);

  scoreText = this.add.text(20, 20, "Score: 0", {
    fontSize: "24px",
    fill: "#ffffff",
  });
  healthText = this.add.text(20, 50, "Health: 3", {
    fontSize: "24px",
    fill: "#ff4444",
  });

  restartButton = this.add
    .text(config.width / 2, config.height / 2, "RESTART", {
      fontSize: "32px",
      fill: "#00ff00",
      backgroundColor: "#000000",
      padding: { x: 20, y: 10 },
    })
    .setOrigin(0.5)
    .setInteractive()
    .setVisible(false)
    .on("pointerdown", () => this.scene.restart());

  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    game.scale.resize(width, height);
    background.setDisplaySize(width, height);
    restartButton.setPosition(width / 2, height / 2);
  });

  // Reset score, health, gameOver, and update texts
  score = 0;
  health = 3;
  gameOver = false;
  scoreText.setText("Score: 0");
  healthText.setText("Health: 3");
}

function update() {
  if (gameOver) return;

  player.setVelocity(0);
  const speed = 500;
  if (cursors.left.isDown) player.setVelocityX(-speed);
  else if (cursors.right.isDown) player.setVelocityX(speed);
  if (cursors.up.isDown) player.setVelocityY(-speed);
  else if (cursors.down.isDown) player.setVelocityY(speed);

  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    const bullet = bullets.get(player.x, player.y - 20);
    if (bullet) {
      bullet.setActive(true).setVisible(true);
      bullet.body.velocity.y = -300;
    }
  }

  enemies.children.each((enemy) => {
    if (enemy.active && enemy.y > config.height) {
      enemy.destroy();
      if (!gameOver) {
        health--;
        healthText.setText("Health: " + health);
        if (health <= 0) {
          hitPlayer(player, enemy);
        }
      }
    }
  });
}

function spawnEnemy() {
  const x = Phaser.Math.Between(50, config.width - 50);
  const enemy = enemies.create(x, 0, "enemy");
  enemy.setVelocityY(100);
}

function handleHit(bullet, enemy) {
  bullets.killAndHide(bullet);
  bullet.body.setVelocity(0);

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
  this.cameras.main.shake(200, 0.01);

  if (gameOver) return;

  health--;
  healthText.setText("Health: " + health);

  if (health <= 0) {
    player.setTint(0xff0000);
    player.setVelocity(0);
    gameOver = true;
    if (this.spawnEvent) {
      this.spawnEvent.remove(false);
    }

    scoreText.setText("GAME OVER! Final Score: " + score);
    healthText.setText("Health: 0");

    enemies.children.each((e) => e.setVelocity(0));
    restartButton.setVisible(true);
  }
}
