var shapeMask;

class level extends Phaser.Scene
{
    constructor(_sceneKey)
    {
        super({key:_sceneKey});
    }

    init(levelInitData)
    {
        this.levelNumber = levelInitData.levelNumber;
        console.log("Starting Level Nº ", levelInitData.levelNumber);
    }


    preload()
    {
        this.cameras.main.setBackgroundColor("#00A");

        this.load.setPath('assets/images/');
        
        this.load.spritesheet('player', 'player.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('playerLives', 'playerLives.png', {frameWidth: 32, frameHeight: 16});
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
        this.load.spritesheet('fygar', 'fygarNormal2.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('fygarInflate', 'fygarInflate.png', {frameWidth: 24, frameHeight: 24});
        this.load.spritesheet('fygarFire', 'fygarFire.png', {frameWidth: 48, frameHeight: 16});
        this.load.image('fireSmall', 'fireSmall.png');
        this.load.image('fireMedium', 'fireMedium.png');
        this.load.image('fireBig', 'fireBig.png');
        
        this.load.image('brush','diggedFromBottom.png');

        // Fruits
        this.load.spritesheet('fruits', 'fruits.png', {frameWidth: 16, frameHeight: 16});

        // Flowers
        this.load.spritesheet('flowers', 'flowers.png', {frameWidth: 16, frameHeight: 24});

        // Rock
        this.load.spritesheet('rock','rock.png', {frameWidth:16,frameHeight:16});

        // Points
        this.load.image('pointsHolder', 'pointsHolder.png', {frameWidth:28,frameHeight:13});

        // Tilemap
        this.load.image('digDugTileset','digDugTilesetPalette.png'); // MUST HAVE SAME TAG AS IN TILED

        this.load.setPath('assets/tilesets/final/');
        const levelFileJSON = 'level'+this.levelNumber+'.json';
        this.load.tilemapTiledJSON('level_tilemap', levelFileJSON);
        this.load.json('level_JSON', levelFileJSON);        

        // Audios
        this.load.setPath('assets/audios/');
        this.load.audio('fygarFire', 'FygarFlame.mp3');
        this.load.audio('enemyBlowUp', 'MonsterBlow.mp3');
        this.load.audio('enemyMoving', 'MonsterMoving.mp3');
    }

    create()
    {
        this.loadLevel();
        this.setupDigging();
       
        this.initLevelObjects();
        this.initPlayer();
        this.initPlayerCollisions();

        this.initScore();
        this.initFruits();

        this.loadAnimations();
        this.loadAudios();

        //this.player.body.collideWorldBounds = true;
        this.physics.add.collider
        (
            this.player,
            this.borders
        );

        this.physics.add.overlap(
            this.player.harpoonH,
            this.enemyGroup,
            this.player.harpoonH.onEnemyOverlap,
            null,
            this
        );

        this.physics.add.overlap(
            this.player.harpoonV,
            this.enemyGroup,
            this.player.harpoonV.onEnemyOverlap,
            null,
            this
        );
    }

    initScore()
    {
        this.pointTexts = [];

        this.highScore = this.add.bitmapText(config.width - gamePrefs.HALF_CELL_SIZE * 8, gamePrefs.CELL_SIZE * 2, 'gameFont', 'HI-    \nSCORE:', 8)
                                            .setTint(uiPrefs.TEXT_COLOR_RED).setOrigin(0, 0);

        this.highestScore = localStorage.getItem(storagePrefs.HIGHEST_SCORE);
        if (this.highestScore == null) this.highestScore = 0;

        this.highScoreCountText = this.add.bitmapText(config.width - gamePrefs.HALF_CELL_SIZE, gamePrefs.CELL_SIZE * 3, 'gameFont', this.highestScore, 8)
                                            .setTint(uiPrefs.TEXT_COLOR_WHITE).setOrigin(1, 0);

        this.firstPlayerScore = this.add.bitmapText(config.width - gamePrefs.CELL_SIZE * 2, gamePrefs.CELL_SIZE * 5, 'gameFont', '1UP:', 8)
                                            .setTint(uiPrefs.TEXT_COLOR_RED).setOrigin(1, 0);

        this.scoreCountText = this.add.bitmapText(config.width - gamePrefs.HALF_CELL_SIZE, gamePrefs.CELL_SIZE * 5.5, 'gameFont', '0', 8)
                                            .setTint(uiPrefs.TEXT_COLOR_WHITE).setOrigin(1, 0);
    }
    
    addScore(_score, _posX, _posY)
    {
        this.player.score += _score;
        this.scoreCountText.setText(this.player.score);

        if (this.player.score > this.highestScore)
        {
            localStorage.setItem(storagePrefs.HIGHEST_SCORE, this.player.score);
        }
        localStorage.setItem(storagePrefs.PLAYER_1_SCORE, this.player.score);

        this.spawnPointsText(_score, _posX, _posY);
    }

    spawnPointsText(_score, _posX, _posY)
    {
        var found = -1;

        var i = 0;
        while (i < this.pointTexts.length && found == -1)
        {
            if (!this.pointTexts.isActive) found = i;
            ++i;
        }

        _posX += 15;
        _posY -= 15;

        if (found == -1)
        {
            const pt = new pointsText(this, _posX, _posY, 'pointsHolder');
            pt.setScoreText(_score);
            pt.startHide();

            this.pointTexts.push(pt);
        }
        else
        {
            const pt = this.pointTexts[found];
            pt.setScoreText(_score);
            pt.show();
            pt.resetPosition(_posX, _posY);
            pt.startHide();
        }

    }

    initFruits()
    {
        this.fruits = [];
        this.fruitsGroup = this.add.group();

        for (var i = 0; i < gamePrefs.NUM_FRUITS; ++i)
        {
            const points = (i+1) * 25 + 200;
            this.fruits.push(new fruitPrefab(this, 0, 0, 'fruits', i, points));
            this.fruitsGroup.add(this.fruits[i]);

            this.fruits[i].setActive(false);
            this.fruits[i].visible = false;
        }

        this.physics.add.overlap(this.player, this.fruitsGroup, this.collectFruit, null, this);
        this.spawnFruitDelayed();     
    }

    spawnFruitDelayed()
    {
        const randomDelay = Phaser.Math.Between(gamePrefs.FRUIT_SPAWN_MIN_DELAY, gamePrefs.FRUIT_SPAWN_MAX_DELAY);
        this.time.delayedCall(randomDelay, this.spawnFruit, [], this);
    }

    spawnFruit()
    {
        const randomFruitIndex = Phaser.Math.Between(0, gamePrefs.NUM_FRUITS-1);        
        this.fruits[randomFruitIndex].enable(this.fruitRespawnPos.x, this.fruitRespawnPos.y);
    }

    collectFruit(_player, _fruit)
    {
        const fruitPos = new Phaser.Math.Vector2(_fruit.x, _fruit.y);
        const playerPos = _player.getCenterPixPos();
        if (fruitPos.distance(playerPos) > gamePrefs.PLAYER_HIT_DIST) return;

        _fruit.disable();
        this.addScore(_fruit.points, fruitPos.x, fruitPos.y);
        this.spawnFruitDelayed();
    }

    update()
    {
        this.setPlayerMoveAxis();
    }

    setPlayerMoveAxis()
    {
        this.setPlayerMoveAxisWithInputs();
    }

    setPlayerMoveAxisWithInputs()
    {
        var xAxis = 0;
        if (this.cursorKeys.right.isDown) xAxis = 1;
        else if (this.cursorKeys.left.isDown) xAxis = -1;

        var yAxis = 0;
        if (this.cursorKeys.down.isDown) yAxis = 1;
        else if (this.cursorKeys.up.isDown) yAxis = -1;

        this.player.setMoveAxis(new Phaser.Math.Vector2(xAxis, yAxis));
    }

    //// CREATE start
    loadLevel()
    {
        // Draw Level
        // Load the JSON
        this.map = this.add.tilemap('level_tilemap');
        // Load tilesets
        this.map.addTilesetImage('digDugTileset');
        // Draw the layers
        this.borders = this.map.createLayer('layer_borders', 'digDugTileset');;
        this.digGround = this.map.createLayer('layer_ground', 'digDugTileset');
        this.surface = this.map.createLayer('layer_surface', 'digDugTileset');

        this.map.setCollisionBetween(3, 49, true, true, 'layer_borders');
        this.map.setCollisionBetween(1, 60, true, true, 'layer_ground');

        
        const levelJSON = this.cache.json.get('level_JSON');
        const levelGroundLayer = levelJSON.layers[2];
        const levelBordersLayer = levelJSON.layers[0];
        this.levelWidth = levelGroundLayer.width;
        this.levelHeight = levelGroundLayer.height;
        this.levelArray = [];
        for (var i = 0; i < this.levelHeight; ++i)
        {
            this.levelArray.push([]);
            for (var j = 0; j < this.levelWidth; ++j)
            {
                const index = (i*this.levelWidth) + j;
                if (levelGroundLayer.data[index] == 0 && 
                    levelBordersLayer.data[index] == 0)
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

    initLevelObjects()
    {        
        new levelFlowers(this, gamePrefs.CELL_SIZE * 15, gamePrefs.CELL_SIZE * 3, 'flowers', this.levelNumber);

        this.rocks = [];
        this.rockCells = [];
        this.enemies = [];
        this.enemyGroup = this.add.group();

        const levelJSON = this.cache.json.get('level_JSON');
        const levelObjects = levelJSON.layers[3].objects;
        for (var i = 0; i < levelObjects.length; ++i)
        {
            const cellPos = this.pix2cell(levelObjects[i].x, levelObjects[i].y);
            const pixPos = this.cell2pix(cellPos.x, cellPos.y);

            this.createObjectOfClass(levelObjects[i].class, pixPos);
        }        
    }

    createObjectOfClass(objectClass, pixPos)
    {
        switch (objectClass)
        {
            case loadPrefs.POOKA_CLASS:
                this.spawnPooka(pixPos);
                break;

            case loadPrefs.FYGAR_CLASS:
                this.spawnFygar(pixPos);
                break;

            case loadPrefs.ROCK_CLASS:
                this.spawnRock(pixPos);
                break;

            case loadPrefs.PLAYER_RESPAWN_CLASS:
                this.playerRespawnPos = new Phaser.Math.Vector2(pixPos.x, pixPos.y);
                break;

            case loadPrefs.FRUIT_RESPAWN_CLASS:
                this.fruitRespawnPos = new Phaser.Math.Vector2(pixPos.x, pixPos.y);
                break;

            default:
                break;
        }
    }


    setupDigging()
    {
        shapeMask = this.make.graphics();
        shapeMask.fillStyle(0xffffff);
        shapeMask.beginPath();

        this.renderTexture = this.add.renderTexture(0, 0, gamePrefs.CELL_SIZE * (gamePrefs.NUM_CELL_WIDTH), gamePrefs.CELL_SIZE * (gamePrefs.NUM_CELL_HEIGHT));

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
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.player = new playerPrefab(this, this.playerRespawnPos.x, this.playerRespawnPos.y, 'player', this.cursorKeys, this.playerRespawnPos,2);
        this.playerLivesUI = this.add.sprite(gamePrefs.CELL_SIZE * 17, gamePrefs.CELL_SIZE * 10,'playerLives',0);
        this.playerLivesUI.setTexture('playerLives', 2-this.player.lives);    
    }

    initPlayerCollisions()
    {
        for (var i = 0; i < this.enemies.length; ++i)
        {
            this.enemies[i].initCollisionsWithPlayer();
            this.enemyGroup.add(this.enemies[i]);
        }
    }
    removeRockCollisions(_rock)
    {
        const index = this.rockCells.indexOf(_rock.spawnCell);

        if (index != -1)
        {
            this.rockCells.splice(index, 1);
        }
            
    }

    spawnRock(pixPos)
    {
        const rock = new rockPrefab(this, pixPos.x, pixPos.y, 'rock');
        this.rocks.push(rock);

        const rockCell = this.pix2cell(pixPos.x, pixPos.y);
        rock.spawnCell = rockCell;
        this.rockCells.push(rockCell);

        this.physics.add.collider
        (
            rock,
            this.borders
        );
        this.physics.add.collider
        (
            rock,
            this.digGround
        );
    }

    spawnPooka(pixPos)
    {
        this.enemies.push(new enemyBase(this, pixPos.x, pixPos.y, 'pooka', 'pookaInflate', 'pookaWalking', 'pookaGhosting', 4, 200));
    }
    
    spawnFygar(pixPos)
    {
        this.enemies.push(new fygarPrefab(this, pixPos.x, pixPos.y, 'fygar', 'fygarInflate', 'fygarWalking', 'fygarGhosting', 3, 300));
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
            frames: this.anims.generateFrameNumbers('fygar', {start: 1, end: 2}),
            frameRate: 2,
            repeat: -1
        });

        this.anims.create
        ({
            key: 'fygarGhosting',
            frames: this.anims.generateFrameNumbers('fygar', {start: 4, end: 5}),
            frameRate: 2,
            repeat: -1
        });

        this.anims.create
        ({
            key: 'fygarAttacking',
            frames: this.anims.generateFrameNumbers('fygar', {start: 0, end: 1}),
            frameRate: 2,
            repeat: -1
        });

        this.anims.create
        ({
            key: 'fygarFireAttack',
            frames: this.anims.generateFrameNumbers('fygarFire', {start: 0, end: 2}),
            frameRate: 2,
            repeat: 0
        });
        //ROCK
        this.anims.create
        ({
            key: 'rockStartFalling',
            frames: this.anims.generateFrameNumbers('rock', {start: 0, end: 1}),
            frameRate: 2,
            repeat: 1
        });
        this.anims.create
        ({
            key: 'rockDestroy',
            frames:this.anims.generateFrameNumbers('rock',{start:2,end:3}),
            frameRate:2,
            repeat:0

        });
    }

    loadAudios()
    {
        // Enemies
        this.fygarFire = this.sound.add('fygarFire');
        this.enemyBlowUp = this.sound.add('enemyBlowUp');
        this.enemyMove = this.sound.add('enemyMoving'); // not doing it 'cause it sucks
    }
    //// CREATE end


    inflateEnemy(_enemy)
    {
        if (!_enemy.canInflate) return;

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

    squishEnemy(_enemy)
    {
        _enemy.setSquished();
    }

    squishPlayer()
    {
        this.player.setSquished();
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

    cellHasRock(_cellPos)
    {
        for (var i = 0; i < this.rockCells.length; ++i)
        {
            const itRockCell = this.rockCells[i];
            if (itRockCell.x == _cellPos.x && itRockCell.y == _cellPos.y)
            {
                return true;
            }
        }
        return false;
    }

    dig(pixPos)
    {
        const cellPos = this.pix2cell(pixPos.x, pixPos.y);
        
        //---> this.digGround = this.map.createLayer('layer_ground', 'digDugTileset');

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

    canMoveToCell(cellX, cellY)
    {
        if (cellX < 0 || cellX >= this.levelArray.width || cellY < 0 || cellY >= this.levelArray.height) return false;
        return this.isEmptyCell(cellX, cellY);
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

    onPlayerLostALive()
    {
        // TODO
        // update HUD
        this.playerLivesUI.setTexture('playerLives',2-this.player.lives)

        // Respawning alive enemies
        for (var i = 0; i < this.enemies.length; ++i)
        {
            if (!this.enemies[i].isDead)
            {
                this.enemies[i].respawn();
            }                
        }
    }

    onPlayerLostAllLives()
    {
        this.playerLivesUI.visible=false;
        // TODO
        this.gameOverText = this.add.bitmapText(config.width/2 -20, config.height/2, 'gameFont', 'GAME OVER', 12)
                                            .setTint(uiPrefs.TEXT_COLOR_WHITE).setOrigin(0.5, 0);
        // update HUD and go to main menu
        
        this.time.delayedCall(3000, this.backToMenu, [], this);
    }

    backToMenu(){
        this.scene.start('menu');
    }

}