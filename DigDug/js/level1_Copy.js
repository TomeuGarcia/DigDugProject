var shapeMask;

class level1_Copy extends Phaser.Scene
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

        // Pooka enemy
        this.load.spritesheet('pooka', 'pookaNormal.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('pookaInflate', 'pookaInflate.png', {frameWidth: 24, frameHeight: 24});
        // Fygar enemy
        this.load.spritesheet('fygar', 'fygarNormal.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('fygarInflate', 'fygarInflate.png', {frameWidth: 24, frameHeight: 24});

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

        this.score = 0; // Testing
        this.spaceDown = false; // Testing
        this.initEnemies();

        this.loadAnimations();
    }

    update()
    {
        ////// nothing

        // TESTING INFLATE
        if (this.cursorKeys.space.isDown && !this.spaceDown && this.pooka)
        {
            this.spaceDown = true;
            this.inflatePooka();
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

        this.map.setCollisionBetween(7, 7, true, true, 'layer_borders');
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
        this.digGround.alpha = 0.5; // make layer invisible

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
        this.pooka = new enemyBase(this, 200, 88, 'pooka', 'pookaInflate').setScale(1).setOrigin(.5);
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
            frameRate: 10,
            repeat: 0
        })

        // ENEMIES
        this.anims.create
        ({
            key: 'pookaWalking',
            frames: this.anims.generateFrameNumbers('pooka', {start: 0, end: 1}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create
        ({
            key: 'pookaGhosting',
            frames: this.anims.generateFrameNumbers('pooka', {start: 2, end: 3}),
            frameRate: 10,
            repeat: -1
        });
    }
    //// CREATE end


    inflatePooka()
    {
        if (!this.pooka.isInInflatedState())
        {
            this.pooka.addInflation();
            this.pooka.setInfaltedState();
        }
        else
        {
            this.pooka.addInflation();
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
        return new Phaser.Math.Vector2(Phaser.Math.FloorTo(pixelX/gamePrefs.CELL_SIZE), 
                                       Phaser.Math.FloorTo(pixelY/gamePrefs.CELL_SIZE));
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
    }

}