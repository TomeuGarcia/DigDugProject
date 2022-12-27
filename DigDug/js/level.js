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
        this.playerLivesCount = levelInitData.playerLivesCount;
        this.playerScoreCount = levelInitData.playerScoreCount;
        console.log(this.playerScoreCount);
    }

    preload()
    {
        this.cameras.main.setBackgroundColor("#00A");

        this.load.setPath('assets/tilesets/final/');
        const levelFileJSON = 'level' + this.levelNumber + '.json';
        this.tilemap_tag = 'level_' + this.levelNumber + '_tilemap';
        this.json_tag = 'level_' + this.levelNumber + '_JSON';


        this.load.tilemapTiledJSON(this.tilemap_tag, levelFileJSON);
        this.load.json(this.json_tag, levelFileJSON);   
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

        //this.loadAnimations();
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

        this.startAnim();
    }

    loadAudios()
    {
        this.stageClear = this.sound.add('stageClear', {volume: audioPrefs.VOLUME});
        this.gameOver = this.sound.add('gameOver', {volume: audioPrefs.VOLUME});
        this.lastOneSound = this.sound.add('lastOneSound', {volume: audioPrefs.VOLUME});
        this.lastOneMusic = this.sound.add('lastOneMusic', {volume: audioPrefs.VOLUME});
        // Enemies
        this.fygarFire = this.sound.add('fygarFire', {volume: audioPrefs.VOLUME});
        this.enemyBlowUp = this.sound.add('enemyBlowUp', {volume: audioPrefs.VOLUME});
        this.enemySquashed = this.sound.add('enemySquashed', {volume: audioPrefs.VOLUME});
        this.enemyMove = this.sound.add('enemyMoving', {volume: audioPrefs.VOLUME}); // not doing it 'cause it sucks
        this.enemyMove.loop = true;
        // Player
        this.playerHarpoon = this.sound.add('playerHarpoon', {volume: audioPrefs.VOLUME});
        this.playerMiss = this.sound.add('playerMiss', {volume: audioPrefs.VOLUME});
        this.playerPumping = this.sound.add('playerPumping', {volume: audioPrefs.VOLUME});
        this.playerDisappearing = this.sound.add('playerDisappearing', {volume: audioPrefs.VOLUME});
        this.playerTouched = this.sound.add('playerTouched', {volume: audioPrefs.VOLUME});
        this.playerWalking = this.sound.add('playerWalking', {volume: audioPrefs.VOLUME});
        this.playerWalking.loop = true;
        // Rock
        this.rockBroken = this.sound.add('rockBroken', {volume: audioPrefs.VOLUME});
        this.rockHit = this.sound.add('rockHit', {volume: audioPrefs.VOLUME});
        this.rockDropping = this.sound.add('rockDropping', {volume: audioPrefs.VOLUME});
        this.rockDropping.loop = true;
    }

    startAnim()
    {
        this.playerMoveAxisFunction = this.setPlayerAnimationInputs;

        this.pauseEnemies();

        this.time.delayedCall(1500, this.finishAnimation, [], this);        
    }
    finishAnimation()
    {
        this.playerMoveAxisFunction = this.setPlayerMoveAndHarpoonInputs;
        this.resumeEnemies();
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

        this.scoreCountText = this.add.bitmapText(config.width - gamePrefs.HALF_CELL_SIZE, gamePrefs.CELL_SIZE * 5.5, 'gameFont', this.playerScoreCount, 8)
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
        this.fruits[randomFruitIndex].resetState();
    }

    collectFruit(_player, _fruit)
    {
        if (!_fruit.canBePickedUp) return;

        const fruitPos = new Phaser.Math.Vector2(_fruit.x, _fruit.y);
        const playerPos = _player.getCenterPixPos();
        if (fruitPos.distance(playerPos) > gamePrefs.PLAYER_HIT_DIST) return;


        //_fruit.disable();
        _fruit.canBePickedUp = false;

        this.add.tween(
            {
                targets: [_fruit],
                duration: 800,
                rotation: 360 * 2 * Phaser.Math.DEG_TO_RAD,
                displayWidth: 0,
                displayHeight: 0,                
                onComplete: _fruit.disable,
                onCompleteScope: _fruit
            }
        )

        this.addScore(_fruit.points, fruitPos.x, fruitPos.y);
        this.spawnFruitDelayed();
    }

    update()
    {
        this.setPlayerInputs();
    }

    checkIfWon()
    {
        if (this.enemyCount <= 0)
        {
            this.stageClear.play();
            this.time.delayedCall(gamePrefs.TIME_UNTIL_NEXT_SCENE, this.loadNextScene, [], this);
        }
    }

    loadNextScene()
    {
        if (this.levelNumber == gamePrefs.LAST_LEVEL_NUMBER)
        {
            this.scene.start('menu');
        }
        else
        {
            const nextLevelNumber = this.levelNumber + 1;
            this.scene.start('level' + nextLevelNumber, 
                            {levelNumber: nextLevelNumber, playerLivesCount: this.player.lives, playerScoreCount: this.player.score});
        }
    }

    setPlayerInputs()
    {
        this.playerMoveAxisFunction();
    }

    setPlayerAnimationInputs()
    {
    }

    setPlayerMoveAndHarpoonInputs()
    {
        var xAxis = 0;
        if (this.cursorKeys.right.isDown) xAxis = 1;
        else if (this.cursorKeys.left.isDown) xAxis = -1;

        var yAxis = 0;
        if (this.cursorKeys.down.isDown) yAxis = 1;
        else if (this.cursorKeys.up.isDown) yAxis = -1;

        this.player.setMoveAxis(new Phaser.Math.Vector2(xAxis, yAxis));

        if (this.cursorKeys.space.isDown) this.player.harpoonKeyPressed = true;
        else if (this.cursorKeys.space.isUp) this.player.harpoonKeyPressed = false;        
    }

    //// CREATE start
    loadLevel()
    {
        // Draw Level
        // Load the JSON
        this.map = this.add.tilemap(this.tilemap_tag);
        // Load tilesets
        this.map.addTilesetImage('digDugTileset');
        // Draw the layers
        this.borders = this.map.createLayer('layer_borders', 'digDugTileset');;
        this.digGround = this.map.createLayer('layer_ground', 'digDugTileset');
        this.surface = this.map.createLayer('layer_surface', 'digDugTileset');

        this.map.setCollisionBetween(3, 49, true, true, 'layer_borders');
        this.map.setCollisionBetween(1, 60, true, true, 'layer_ground');

        
        const levelJSON = this.cache.json.get(this.json_tag);
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
        this.enemyCount = 0;

        const levelJSON = this.cache.json.get(this.json_tag);
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

        this.digBrush = this.make.image({key: 'brush'}, false).setOrigin(0.5); //////////
    }

    initPlayer()
    {
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.player = new playerPrefab(this, this.playerRespawnPos.x, this.playerRespawnPos.y, 'player', 
                                       this.cursorKeys, this.playerRespawnPos, this.playerLivesCount);
        this.player.score = this.playerScoreCount;

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
        
        
        if (false) // Smooth digging
        {
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

            shapeMask.fillRect(desiredX-1, desiredY-1, gamePrefs.CELL_SIZE, gamePrefs.CELL_SIZE);
        }
        else // Not smooth digging, but with sprite
        {
            const cellPixPos = this.cell2pix(cellPos.x, cellPos.y);

            if (this.player.playerMovement == PlayerMovement.DOWN)
            {
                this.digBrush.flipY = pixPos.y <= cellPixPos.y;
                this.digBrush.rotation = 0;
            }
            else if (this.player.playerMovement == PlayerMovement.UP)
            {
                this.digBrush.flipY = pixPos.y <= cellPixPos.y;
                this.digBrush.rotation = 0;
            }
            else if (this.player.playerMovement == PlayerMovement.RIGHT)
            {
                this.digBrush.flipY = false;
                this.digBrush.rotation = (pixPos.x <= cellPixPos.x ? 90 : 270) * Phaser.Math.DEG_TO_RAD;
            }
            else 
            {
                this.digBrush.flipY = false;
                this.digBrush.rotation = (pixPos.x <= cellPixPos.x ? 90 : 270) * Phaser.Math.DEG_TO_RAD;
            }
    
            this.renderTexture.erase(this.digBrush, cellPixPos.x, cellPixPos.y);
        }    
        
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
        this.playerMoveAxisFunction = this.setPlayerAnimationInputs;
        this.time.delayedCall(gamePrefs.TIME_PAUSE_PLAYER_KILLED, 
                              () => this.playerMoveAxisFunction = this.setPlayerMoveAndHarpoonInputs, [], 
                              this);

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

        this.gameOver.play();
        
        this.time.delayedCall(3000, this.backToMenu, [], this);
    }

    backToMenu(){
        this.scene.start('menu');
    }

    pauseEnemies()
    {
        for (var i = 0; i < this.enemies.length; ++i)
        {
            this.enemies[i].setPaused();
        }
    }

    resumeEnemies()
    {
        for (var i = 0; i < this.enemies.length; ++i)
        {
            this.enemies[i].resetPatrol();
        }
    }

}