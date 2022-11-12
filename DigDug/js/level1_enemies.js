var shapeMask;

class level1_enemies extends Phaser.Scene
{
    constructor()
    {
        super({key:'level1_enemies'});
    }

    preload()
    {
        this.cameras.main.setBackgroundColor("#00A");

        this.load.setPath('assets/images/');
        this.load.image('foreground', 'foreground.png');
        this.load.image('player', 'digDugGuy.png');
        this.load.image('maskDigBottom', 'diggedFromBottom.png');
        this.load.image('maskDigBottomRight', 'diggedCornerBottomRight.png');

        this.load.image('pooka', 'pooka.png');

        this.load.image('test_level_1','testingTiles.png'); // MUST HAVE SAME TAG AS IN TILED

        this.load.setPath('assets/tilesets/');
        this.load.tilemapTiledJSON('testLevel1', 'testLevel1.json');
    }

    create()
    {
        this.score = 0;
        this.spaceDown = false;

        this.loadMap();
        this.setupDigging();
        
        this.initPlayer();

        this.initInputs();

        this.initEnemies();
    }

    update()
    {
        this.getInputs();
        this.movePlayer();
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
        this.map.createLayer('layer_surface', 'test_level_1');

        this.map.setCollisionBetween(7, 7, true, true, 'layer_borders');
        this.map.setCollisionBetween(1, 10, true, true, 'layer_ground');
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
        this.digGround.alpha = 0.0; // make layer invisible
    }

    initPlayer()
    {
        this.mapPixelOffset = new Phaser.Math.Vector2(gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_LEFT_OFFSET + gamePrefs.HALF_CELL_SIZE,
            gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_TOP_OFFSET + gamePrefs.HALF_CELL_SIZE);  

        this.player = this.physics.add.sprite(this.mapPixelOffset.x, this.mapPixelOffset.y, 'player').setScale(1).setOrigin(.5);
        this.player.body.collideWorldBounds = true;

        this.physics.add.collider
        (
            this.player,
            this.borders
        );
    }

    initInputs()
    {
        this.cursorKeys = this.input.keyboard.createCursorKeys();

        this.moveX = 0;
        this.moveY = 0;
        this.lastMoveX = 0;
        this.lastMoveY = 0;
    }

    initEnemies()
    {        
        this.pooka = new enemyBase(this, 200, 88, 'pooka').setScale(1).setOrigin(.5);
    }
    //// CREATE end


    //// UPDATE start
    getInputs()
    {
        if (this.moveX != 0) this.lastMoveX = this.moveX;
        if (this.moveY != 0) this.lastMoveY = this.moveY;

        this.moveX = 0;
        this.moveY = 0;

        if (this.cursorKeys.right.isDown) this.moveX += gamePrefs.PLAYER_MOVE_SPEED;
        if (this.cursorKeys.left.isDown) this.moveX -= gamePrefs.PLAYER_MOVE_SPEED;

        if (this.cursorKeys.up.isDown) this.moveY -= gamePrefs.PLAYER_MOVE_SPEED;
        if (this.cursorKeys.down.isDown) this.moveY += gamePrefs.PLAYER_MOVE_SPEED;

        // TESTIN INFLATE
        if (this.cursorKeys.space.isDown && !this.spaceDown)
        {
            this.spaceDown = true;
            this.inflatePooka();
        }
        else if (this.cursorKeys.space.isUp)
        {
            this.spaceDown = false;
        }
    }

    movePlayer()
    {
        if (this.canMoveHorizontaly())
        {
            if (this.moveX == 0 && this.moveY != 0 && !this.canMoveVertically())
            {
                this.player.setVelocityX(this.lastMoveX * gamePrefs.PLAYER_MOVE_SPEED);
                //this.player.x += this.lastMoveX;
                //this.player.body.position.x += this.lastMoveX;
            }
            else
            {
                // Move normal
                this.player.setVelocityX(this.moveX * gamePrefs.PLAYER_MOVE_SPEED);
                //this.player.x += this.moveX;
                //this.player.body.position.x += this.moveX;
            }
            this.dig();

            if (this.moveX != 0) 
            {
                this.player.setVelocityY(0);
                return;
            }
        }


        if (this.canMoveVertically())
        {
            if (this.moveY == 0 && this.moveX != 0 && !this.canMoveHorizontaly())
            {
                this.player.setVelocityY(this.lastMoveY * gamePrefs.PLAYER_MOVE_SPEED);
                //this.player.y += this.lastMoveY;
                //this.player.body.position.y += this.lastMoveY;
            }
            else
            {
                // Move normal
                this.player.setVelocityY(this.moveY * gamePrefs.PLAYER_MOVE_SPEED);
                //this.player.y += this.moveY;
                //this.player.body.position.y += this.moveY;
            }
            this.dig();
        }
        
    }

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
    //// UPDATE end

    
    //// OTHER
    dig()
    {
        const playerX = this.player.body.x+1;
        const playerY = this.player.body.y+1;

        const cellPos = this.pix2cell(playerX, playerY);
        const tile = this.digGround.getTileAt(cellPos.x, cellPos.y);

        if (tile)
        {
            if (tile.collides)
            {
                tile.setCollision(false, false, false, false, true);
            }
        }

        shapeMask.fillRect(playerX, playerY, gamePrefs.CELL_SIZE-2, gamePrefs.CELL_SIZE-2);
    }

    canMoveHorizontaly()
    {
        return this.canMove(parseInt(this.player.body.y) + gamePrefs.HALF_CELL_SIZE);
    }

    canMoveVertically()
    {
        return this.canMove(parseInt(this.player.body.x) + gamePrefs.HALF_CELL_SIZE);
    }

    canMove(pixel)
    {
        return (pixel % gamePrefs.CELL_SIZE) == gamePrefs.HALF_CELL_SIZE;
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

}