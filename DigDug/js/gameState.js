var shapeMask;


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

        this.mask = shapeMask.createGeometryMask().setInvertAlpha(true);

        this.foreground = this.add.tileSprite(gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_LEFT_OFFSET, gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_TOP_OFFSET, 
                                              gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_WIDTH, gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_HEIGHT, 
                                              'foreground').setOrigin(0);
        this.foreground.setMask(this.mask);

        this.player = this.physics.add.sprite(gamePrefs.HALF_CELL_SIZE, gamePrefs.HALF_CELL_SIZE, 'player').setScale(1).setOrigin(.5);
        this.player.body.collideWorldBounds = true;
        this.addSquareToMask();

        this.cursorKeys = this.input.keyboard.createCursorKeys();

        this.grid = new Array(gamePrefs.NUM_CELL_HEIGHT);
        for (var row = 0; row < gamePrefs.NUM_CELL_HEIGHT; ++row)
        {
            this.grid[row] = new Array(gamePrefs.NUM_CELL_WIDTH);
            for (var col = 0; col < gamePrefs.NUM_CELL_WIDTH; ++col)
            {
                this.grid[row][col] = 1;
            }
        }


        this.moveX = 0;
        this.moveY = 0;
        this.lastMoveX = 0;
        this.lastMoveY = 0;

        
        const mask = this.make.image(
            {
                x: 100,
                y: 100,
                key: 'maskDigBottom',
                add: false
            }
        )

/*
        const bitmapMask = new Phaser.Display.Masks.BitmapMask(this, mask);
        bitmapMask.invertAlpha = true;
        this.foreground.mask = bitmapMask;
        this.input.on('pointerdown', 
            function (pointer) 
            {
                var mask2 = this.make.image(
                    {
                        x: pointer.x,
                        y: pointer.y,
                        key: 'maskDigBottom',
                        add: false
                    }
                )
        
                const bitmapMask2 = new Phaser.Display.Masks.BitmapMask(this, mask2);
                bitmapMask2.invertAlpha = true;
                this.foreground.mask = bitmapMask2;
            },
            this
        );
  */      
        
        
        var renderTexture = this.add.renderTexture(gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_LEFT_OFFSET, gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_TOP_OFFSET, 
                                                   gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_WIDTH, gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_HEIGHT);
        //var mask2 = renderTexture.createBitmapMask();
        //mask2.invertAlpha = true;
        
        //this.foreground.setMask(mask2);

        this.input.on('pointerdown',
            function(pointer)
            {
                renderTexture.draw('maskDigBottom', pointer.x-gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_LEFT_OFFSET -8, 
                                                    pointer.y-gamePrefs.CELL_SIZE * gamePrefs.NUM_CELL_TOP_OFFSET - 8);
                
                var maskSprite = this.add.sprite(pointer.x, pointer.y, renderTexture);

                var mask3 = maskSprite.createBitmapMask();
                mask3.invertAlpha = true;
                this.foreground.setMask(mask3);
            },
            this
        );
        

        /*
        this.maskContainer = this.add.container(0,0);
        this.maskContainer.add(mask);

        this.input.on('pointerdown',
            function(pointer)
            {
                const mask2 = this.make.image(
                    {
                        x: pointer.x,
                        y: pointer.y,
                        key: 'maskDigBottom',
                        add: false
                    }
                )

                this.maskContainer.add(mask2);                        
                var bitmapMask = new Phaser.Display.Masks.BitmapMask(this, this.maskContainer);
                bitmapMask.invertAlpha = true;
                this.foreground.setMask(bitmapMask);
            }, 
            this
        );

        var bitmapMask = new Phaser.Display.Masks.BitmapMask(this, mask);
        bitmapMask.invertAlpha = true;
        this.foreground.mask = bitmapMask;
            */
    }



    update()
    {
        this.getInputs();
        this.movePlayer();

        //var v = this.pix2cell(60,60);
        //console.log(v.x);
        //console.log(v.y);
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
        return new Phaser.Math.Vector2(pixelX/gamePrefs.CELL_SIZE, pixelY/gamePrefs.CELL_SIZE);
    }

}