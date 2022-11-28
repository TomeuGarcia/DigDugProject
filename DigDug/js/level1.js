var shapeMask;

class level1 extends Phaser.Scene
{
    constructor()
    {
        super({key:'level1'});
    }

    preload()
    {
        this.cameras.main.setBackgroundColor("#00A");

        this.load.setPath('assets/images/');
        
        this.load.spritesheet('player', 'player.png', {frameWidth: 16, frameHeight: 16});
        this.load.image('maskDigBottom', 'diggedFromBottom.png');
        this.load.image('maskDigBottomRight', 'diggedCornerBottomRight.png');
        this.load.image('watermelon', 'watermelon.png');
        this.load.image('harpoonH', 'harpoonHorizontal.png');
        this.load.image('harpoonV', 'harpoonVertical.png');
        this.load.image('maskHarpoonH', 'harpoonHorizontalMask.png');
        this.load.image('maskHarpoonV', 'harpoonVerticalMask.png');

        // Pooka enemy
        this.load.spritesheet('pooka', 'pookaNormal.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('pookaInflate', 'pookaInflate.png', {frameWidth: 24, frameHeight: 24});
        // Fygar enemy
        this.load.spritesheet('fygar', 'fygarNormal.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('fygarInflate', 'fygarInflate.png', {frameWidth: 24, frameHeight: 24});
        this.load.spritesheet('fygarFire', 'fygarFire.png', {frameWidth: 48, frameHeight: 16});
        

        this.load.image('test_level_1','testingTiles.png'); // MUST HAVE SAME TAG AS IN TILED
        
        this.load.image('brush','diggedFromBottom.png');

        this.load.setPath('assets/tilesets/');
        this.load.tilemapTiledJSON('testLevel1', 'testLevel1.json');
        this.load.json('levelJSON', 'testLevel1.json');
    }

    create()
    {
        this.loadMap();
        this.setupDigging();

        this.initPlayer();
       
        this.initScore();
        this.initFruit();

        this.score = 0; // Tes
        
        this.spaceDown = false; // Testing
        this.initEnemies();

        this.loadAnimations();

        this.physics.add.overlap(
            this.player.harpoonH,
            this.enemies,
            this.player.harpoonH.onEnemyOverlap,
            null,
            this
        );
        this.physics.add.overlap(
            this.player.harpoonV,
            this.enemies,
            this.player.harpoonV.onEnemyOverlap,
            null,
            this
        );
    }

    initScore()
    {
        this.score = 0;
        this.scoreText = this.add.text(gamePrefs.CELL_SIZE * 15 + gamePrefs.HALF_CELL_SIZE, gamePrefs.CELL_SIZE * 2, 
            'SCORE:', { fontSize: '12px', fill: '#fff' });
        this.scoreCountText = this.add.text(gamePrefs.CELL_SIZE * 16 + gamePrefs.HALF_CELL_SIZE, gamePrefs.CELL_SIZE * 3, 
            '0', { fontSize: '12px', fill: '#fff' });
    }
    addScore(_score)
    {
        this.score += _score;
        this.scoreCountText.setText(this.score);
    }

    initFruit()
    {
        this.fruits = this.physics.add.staticGroup();
        this.physics.add.overlap(this.player, this.fruits, this.collectFruit, null, this);
        this.spawnFruit();
        
    }
    spawnFruit()
    {
        this.fruits.create(gamePrefs.CELL_SIZE * 7 + gamePrefs.HALF_CELL_SIZE, gamePrefs.CELL_SIZE * 10 + gamePrefs.HALF_CELL_SIZE, 'watermelon');
    }
    collectFruit(_player, _fruit)
    {
        _fruit.disableBody(true, true);
        this.addScore(30);
        const randomDelay = Phaser.Math.Between(10000, 20000);
        this.time.delayedCall(randomDelay, this.spawnFruit, [], this);
    }

    update()
    {
        ////// nothing

        // TESTING INFLATE
        if (this.cursorKeys.space.isDown && !this.spaceDown && this.pooka)
        {
            this.spaceDown = true;
            //this.inflatePooka();
        }
        else if (this.cursorKeys.space.isUp)
        {
            this.spaceDown = false;
        }
    }

    //// CREATE start
    loadMap()
    {
        // Draw Level
        // Load the JSON
        this.map = this.add.tilemap('testLevel1');
        // Load tilesets
        this.map.addTilesetImage('test_level_1');
        // Draw the layers
        this.borders = this.map.createLayer('layer_borders', 'test_level_1');
        this.digGround = this.map.createLayer('layer_ground', 'test_level_1');
        this.surface = this.map.createLayer('layer_surface', 'test_level_1');

        this.map.setCollisionBetween(3, 3, true, true, 'layer_borders');
        this.map.setCollisionBetween(1, 10, true, true, 'layer_ground');

        
        const levelGroundLayer = this.cache.json.get('levelJSON').layers[0];
        this.levelWidth = levelGroundLayer.width;
        this.levelHeight = levelGroundLayer.height;
        this.levelArray = [];
        for (var i = 0; i < this.levelHeight; ++i)
        {
            this.levelArray.push([]);
            for (var j = 0; j < this.levelWidth; ++j)
            {
                if (levelGroundLayer.data[(i*this.levelWidth) + j] == 0)
                {
                    this.levelArray[i].push(MapContent.Empty)
                }
                else
                {
                    const x = i % this.levelWidth;
                    const y = i / this.levelHeight;
    
                    this.levelArray[i].push(MapContent.Ground);                    
                }
            }
        }   
    }

    setupDigging()
    {
        shapeMask = this.make.graphics();
        shapeMask.fillStyle(0xffffff);
        shapeMask.beginPath();

        this.renderTexture = this.add.renderTexture(0, 0, gamePrefs.CELL_SIZE * (gamePrefs.NUM_CELL_WIDTH+2), gamePrefs.CELL_SIZE * (gamePrefs.NUM_CELL_HEIGHT+2));

        this.mask = shapeMask.createGeometryMask().setInvertAlpha(true);
        this.renderTexture.mask = this.mask;

        this.renderTexture.draw(this.digGround);
        this.renderTexture.draw(this.surface);
        this.digGround.alpha = 0.5; // make layer invisible
        this.surface.alpha = 0.5;

        this.brush = this.make.image({key: 'brush'}, false).setOrigin(0.5); //////////
    }

    initPlayer()
    {
        const playerStart = new Phaser.Math.Vector2(gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_LEFT_OFFSET + gamePrefs.HALF_CELL_SIZE,
                                                   gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_TOP_OFFSET + gamePrefs.HALF_CELL_SIZE);  

        this.cursorKeys = this.input.keyboard.createCursorKeys();

        this.player = new playerPrefab(this, playerStart.x, playerStart.y, 'player', this.cursorKeys).setScale(1).setOrigin(.5);

        this.player.body.collideWorldBounds = true;
        this.physics.add.collider
        (
            this.player,
            this.borders
        );
    }

    initEnemies()
    {
        this.enemies = this.add.group();
        this.pooka = new enemyBase(this, 200, 88, 'pooka', 'pookaInflate', 'pookaWalking', 'pookaGhosting').setOrigin(.5);
        this.enemies.add(this.pooka);
    }

    loadAnimations()
    {
        this.anims.create
        ({
            key: 'playerRun',
            frames: this.anims.generateFrameNumbers('player', {start: 0, end: 1}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create
        ({
            key: 'playerRunDigging',
            frames: this.anims.generateFrameNumbers('player', {start: 2, end: 3}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create // Only plays when the player presses (if not it stays on frame 4)
        ({
            key: 'playerPumping',
            frames: this.anims.generateFrameNumbers('player', {start: 4, end: 5}),
            frameRate: 10,
            repeat: 0
        })

        this.anims.create
        ({
            key: 'playerDying',
            frames: this.anims.generateFrameNumbers('player', {start: 8, end: 13}),
            frameRate: 2,
            repeat: 0
        })

        // POOKA
        this.anims.create
        ({
            key: 'pookaWalking',
            frames: this.anims.generateFrameNumbers('pooka', {start: 0, end: 1}),
            frameRate: 2,
            repeat: -1
        });

        this.anims.create
        ({
            key: 'pookaGhosting',
            frames: this.anims.generateFrameNumbers('pooka', {start: 2, end: 3}),
            frameRate: 2,
            repeat: -1
        });

        // FYGAR
        this.anims.create
        ({
            key: 'fygarWalking',
            frames: this.anims.generateFrameNumbers('fygar', {start: 0, end: 1}),
            frameRate: 2,
            repeat: -1
        });

        this.anims.create
        ({
            key: 'fygarGhosting',
            frames: this.anims.generateFrameNumbers('fygar', {start: 6, end: 7}),
            frameRate: 2,
            repeat: -1
        });

        this.anims.create
        ({
            key: 'fygarAttacking',
            frames: this.anims.generateFrameNumbers('fygar', {start: 3, end: 4}),
            frameRate: 2,
            repeat: -1
        });

        this.anims.create
        ({
            key: 'fygarFireAttack',
            frames: this.anims.generateFrameNumbers('fygarFire', {start: 0, end: 2}),
            frameRate: 2,
            repeat: -1
        });
    }
    //// CREATE end


    inflateEnemy(_enemy)
    {
        if (_enemy.isInInflatedState())
        {
            _enemy.addInflation();
        }
        else
        {
            _enemy.addInflation();
            _enemy.setInfaltedState();
        }
    }

    
    //// OTHER
    canMoveHorizontaly(body)
    {
        return this.canMove(parseInt(body.y) + gamePrefs.HALF_CELL_SIZE);
    }

    canMoveVertically(body)
    {
        return this.canMove(parseInt(body.x) + gamePrefs.HALF_CELL_SIZE);
    }

    canMove(pixel)
    {
        return (pixel % gamePrefs.CELL_SIZE) == gamePrefs.HALF_CELL_SIZE;
    }

    dig(pixPos)
    {
        const cellPos = this.pix2cell(pixPos.x, pixPos.y);
        
        const tile = this.digGround.getTileAt(cellPos.x, cellPos.y);
        
        if (tile)
        {
            if (tile.collides)
            {
                tile.setCollision(false, false, false, false, true);
                this.player.isDigging = true;
            }
        }
        

        // remove decimal part
        var desiredX = ~~pixPos.x;
        var desiredY = ~~pixPos.y;

        desiredX -= gamePrefs.HALF_CELL_SIZE;
        desiredY -= gamePrefs.HALF_CELL_SIZE;

        if (desiredX % gamePrefs.CELL_SIZE != 1){
            desiredX--;
        }
        if (desiredY % gamePrefs.CELL_SIZE != 1){
            desiredY--;
        }

        //shapeMask.fillRect(desiredX, desiredY, gamePrefs.CELL_SIZE-2, gamePrefs.CELL_SIZE-2);
        shapeMask.fillRect(desiredX-1, desiredY-1, gamePrefs.CELL_SIZE, gamePrefs.CELL_SIZE);

        /*
        const pixPos2 = this.cell2pix(cellPos.x, cellPos.y);
        if (this.player.moveY > 0) this.brush.flipY = true;
        else this.brush.flipY = false;
        this.renderTexture.erase(this.brush, pixPos2.x, pixPos2.y);
        */
    }

    pix2cell(pixelX, pixelY)
    {
        return new Phaser.Math.Vector2(parseInt(pixelX/gamePrefs.CELL_SIZE), 
                                       parseInt(pixelY/gamePrefs.CELL_SIZE));
    }

    cell2pix(cellX, cellY)
    {
        return new Phaser.Math.Vector2((cellX * gamePrefs.CELL_SIZE) + gamePrefs.HALF_CELL_SIZE, 
                                       (cellY * gamePrefs.CELL_SIZE) + gamePrefs.HALF_CELL_SIZE);
    }


    isGroundCell(cellX, cellY)
    {
        return this.levelArray[cellY][cellX] == MapContent.Ground;
    }

    isEmptyCell(cellX, cellY)
    {
        return this.levelArray[cellY][cellX] == MapContent.Empty;
    }

    removeGroundCell(cellX, cellY)
    {
        this.levelArray[cellY][cellX] = MapContent.Empty;

        const pixPos = this.cell2pix(cellX, cellY);

        shapeMask.fillRect(pixPos.x - game.HALF_CELL_SIZE -1, pixPos.y - game.HALF_CELL_SIZE-1, gamePrefs.CELL_SIZE, gamePrefs.CELL_SIZE);
    }

    notifyPlayerEnemyReleased()
    {
        this.player.onEnemyGotReleased();
    }

    notifyPlayerEnemyDiedInflated()
    {
        this.player.onEnemyDiedInflated();
    }


}