var shapeMask;

const MapContent = {
    Ground: 1,
    Empty: 0
}

class gameState extends Phaser.Scene
{
    constructor()
    {
        super({key:'gameState'});
    }

    preload()
    {
        this.cameras.main.setBackgroundColor("#000");

        this.load.setPath('assets/images/');
        this.load.image('foreground', 'foreground.png');
        this.load.image('player', 'digDugGuy.png');
        this.load.image('maskDigBottom', 'diggedFromBottom.png');
        this.load.image('maskDigBottomRight', 'diggedCornerBottomRight.png');
    }

    create()
    {
        shapeMask = this.make.graphics();
        shapeMask.fillStyle(0xffffff);
        shapeMask.beginPath();


        this.mapPixelOffset = new Phaser.Math.Vector2(gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_LEFT_OFFSET + gamePrefs.HALF_CELL_SIZE,
            gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_TOP_OFFSET + gamePrefs.HALF_CELL_SIZE);  
        
        this.mapCellOffset = this.pix2cell(this.mapPixelOffset.x, this.mapPixelOffset.y);



        this.foreground = this.add.tileSprite(gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_LEFT_OFFSET, gamePrefs.CELL_SIZE * (gamePrefs.NUM_CELL_TOP_OFFSET + gamePrefs.NUM_CELL_TOP_AIR), 
                                              gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_WIDTH, gamePrefs.CELL_SIZE * (gamePrefs.NUM_CELL_HEIGHT-1), 
                                              'foreground').setOrigin(0);

        this.mask = shapeMask.createGeometryMask().setInvertAlpha(true);
        this.foreground.setMask(this.mask);
                                            

        this.player = this.physics.add.sprite(this.mapPixelOffset.x, this.mapPixelOffset.y, 'player').setScale(1).setOrigin(.5);
        this.player.body.collideWorldBounds = true;
        this.addSquareToMask();



        // Initialize Map (hardcoded)
        this.grid = new Array(gamePrefs.NUM_CELL_HEIGHT);
        for (var row = 0; row < gamePrefs.NUM_CELL_HEIGHT; ++row)
        {
            this.grid[row] = new Array(gamePrefs.NUM_CELL_WIDTH);
            for (var col = 0; col < gamePrefs.NUM_CELL_WIDTH; ++col)
            {
                if (row <= 0){
                    this.grid[row][col] = MapContent.Empty;
                }
                else {
                    this.grid[row][col] = MapContent.Ground;
                }
            }
        }



        this.cursorKeys = this.input.keyboard.createCursorKeys();

        this.moveX = 0;
        this.moveY = 0;
        this.lastMoveX = 0;
        this.lastMoveY = 0;

        

        this.renderTexture = this.add.renderTexture(gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_LEFT_OFFSET, gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_TOP_OFFSET, 
                                                   gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_WIDTH, gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_HEIGHT);
        //var mask2 = renderTexture.createBitmapMask();
        //mask2.invertAlpha = true;
        
        //this.foreground.setMask(mask2);

        this.input.on('pointerdown',
            function(pointer)
            {
                /*
                renderTexture.draw('maskDigBottom', pointer.x-gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_LEFT_OFFSET -8, 
                                                    pointer.y-gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_TOP_OFFSET - 8);
                
                var maskSprite = this.add.sprite(pointer.x, pointer.y, renderTexture);

                var mask3 = maskSprite.createBitmapMask();
                mask3.invertAlpha = true;
                this.foreground.setMask(mask3);
                */
            },
            this
        );

    }



    update()
    {
        this.getInputs();
        this.movePlayer();


        
        // Testing
        console.clear();      
        const playerCellPos = this.pix2cell(this.player.x -  this.mapPixelOffset.x + gamePrefs.HALF_CELL_SIZE, this.player.y -  this.mapPixelOffset.y + gamePrefs.HALF_CELL_SIZE);
        
        if (playerCellPos.x >= 0 && playerCellPos.y >= 0)
        {
            const gridTile = this.grid[playerCellPos.y][playerCellPos.x];
            console.log(gridTile);
            if (gridTile == MapContent.Ground)
            {
                this.grid[playerCellPos.y][playerCellPos.x] = MapContent.Empty;
            }
        }

    }


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
    }

    movePlayer()
    {
        if (this.canMoveHorizontaly())
        {
            if (this.moveX == 0 && this.moveY != 0 && !this.canMoveVertically())
            {
                this.player.x += this.lastMoveX;
            }
            else
            {
                // Move normal
                this.player.x += this.moveX;
            }
            this.addSquareToMask();
        }

        if (this.canMoveVertically())
        {
            if (this.moveY == 0 && this.moveX != 0 && !this.canMoveHorizontaly())
            {
                this.player.y += this.lastMoveY;
            }
            else
            {
                // Move normal
                this.player.y += this.moveY;
            }
            this.addSquareToMask();
        }
        
    }

    addSquareToMask()
    {
        shapeMask.fillRect(this.player.x - gamePrefs.HALF_CELL_SIZE+1, this.player.y - gamePrefs.HALF_CELL_SIZE+1, gamePrefs.CELL_SIZE-2, gamePrefs.CELL_SIZE-2);
    }

    canMoveHorizontaly()
    {
        return this.canMove(this.player.y);
    }

    canMoveVertically()
    {
        return this.canMove(this.player.x);
    }

    canMove(pixel)
    {
        return (pixel % gamePrefs.CELL_SIZE) == (gamePrefs.CELL_SIZE / 2);
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