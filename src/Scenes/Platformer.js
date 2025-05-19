class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // Variables and physics settings
        this.PARTICLE_VELOCITY = -30;
        this.ACCELERATION = 800;
        this.MAXACCELERATION = 2000;
        this.DRAG = 2000;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -900;
    }

    create() {
        // Tilemap setup
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 120, 20);
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setScale(2.0);
        this.groundLayer.setCollisionByProperty({ collides: true });

        // Coins from Tiled object layer
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.coins.forEach(coin => {
            coin.setScale(2);
            coin.x *= 2;
            coin.y *= 2;
        });

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);

        this.spawn = this.map.createFromObjects('Spawn', {
            name: 'flag',
            key: "tilemap_sheet",
            frame:111,
        });

        this.spawn.forEach(flag => {
            flag.setScale(2);
            flag.x *= 2;
            flag.y *= 2;
        })
        this.spawnx = this.spawn[0].x;
        this.spawny = this.spawn[0].y;

        // Player setup
        my.sprite.player = this.physics.add
            .sprite(this.spawnx, this.spawny, "platformer_characters", "tile_0000.png")
            .setScale(SCALE);

        my.sprite.player.setCollideWorldBounds(true);
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        my.sprite.player.body.setMaxVelocityX(this.MAXACCELERATION);

        this.playerX = my.sprite.player.x;
        this.playerY = my.sprite.player.y;

        // Camera setup
        this.mapWidth = this.map.widthInPixels;
        this.mapHeight = this.map.heightInPixels;
        this.cameras.main.setBounds(0, 0, this.mapWidth * 2, this.mapHeight);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25, -900);
        this.cameras.main.setZoom(1);

        // Coin overlap
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (player, coin) => {
            coin.destroy();
        });

        // Step particle effect
        my.vfx = {};
        my.vfx.walking = this.add.particles(0, 0, 'dirt_01.png', {
            scale: { start: 0.1, end: 0.1 },
            lifespan: 350,
            gravityY: -400,
            alpha: { start: 1, end: 0.1 }
        });
        my.vfx.walking.stop();

        // Input
        cursors = this.input.keyboard.createCursorKeys();

        // Debug toggle
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.clear();
        }, this);
    }

    update() {
        // Move left
        if (cursors.left.isDown) {
            my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            // Left particles
            my.vfx.walking.startFollow(
                my.sprite.player,
                my.sprite.player.displayWidth / 2 - 10,
                my.sprite.player.displayHeight / 2 - 5,
                false
            );
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

        // Move right
        } else if (cursors.right.isDown) {
            my.sprite.player.body.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            // Right particles
            my.vfx.walking.startFollow(
                my.sprite.player,
                my.sprite.player.displayWidth / 2 + 10,
                my.sprite.player.displayHeight / 2 - 5,
                false
            );
            my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

        // Idle
        } else {
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }

        // Jump or fall
        if (!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if (my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }
    }
}
