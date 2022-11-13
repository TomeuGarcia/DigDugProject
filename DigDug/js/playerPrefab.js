
const PlayerMovement = {
    NONE: 0,
    RIGHT: 1,
    LEFT: 2,
    UP: 3,
    DOWN: 4
}

class playerPrefab extends Phaser.GameObjects.Sprite
{

    constructor(_scene, _positionX, _positionY, _spriteTag = 'player', _cursors)
    {
        super(_scene, _positionX, _positionY, _spriteTag);

        _scene.add.existing(this);
        _scene.physics.world.enable(this);

        this.scene = _scene;
        this.cursorKeys = _cursors;
        this.moveX = 0;
        this.moveY = 0;
        this.lastMoveX = 0;
        this.lastMoveY = 0;

        this.playerMovement = PlayerMovement.NONE;
        this.lastPlayerMovement = PlayerMovement.NONE;

        this.currentCell = this.scene.pix2cell(this.body.x, this.body.y);
        this.isDigging = false;
    }


    preUpdate(time, delta)
    {
        super.preUpdate(time, delta);

        this.getInputs();
        this.move();

        
        if (this.moveX == 0 && this.moveY == 0)
        {
            this.anims.pause();
        }
        else
        {
            this.rotateSprite();           

            this.checkDigging();

            if (this.isDigging) this.anims.play('playerRunDigging', true);
            else this.anims.play('playerRun', true);
        }

        if (this.moveX != 0 || this.moveY != 0)
        {
            this.digHere();
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

        if (this.moveX != 0) return;

        if (this.cursorKeys.up.isDown) this.moveY -= gamePrefs.PLAYER_MOVE_SPEED;
        if (this.cursorKeys.down.isDown) this.moveY += gamePrefs.PLAYER_MOVE_SPEED;
    }

    move()
    {
        this.lastPlayerMovement = this.playerMovement;

        const canMoveVertically = this.scene.canMoveVertically(this.body);
        const canMoveHorizontaly = this.scene.canMoveHorizontaly(this.body);

        if (canMoveHorizontaly)
        {
            if (this.moveX == 0 && this.moveY != 0 && !canMoveVertically)
            {
                this.body.setVelocityX(this.lastMoveX);
            }
            else
            {
                // Move normaly
                this.body.setVelocityX(this.moveX);
            }

            if (this.moveX > 0) this.playerMovement = PlayerMovement.RIGHT
            else if (this.moveX < 0) this.playerMovement = PlayerMovement.LEFT
        }


        if (canMoveVertically)
        {
            if (this.moveY == 0 && this.moveX != 0 && !canMoveHorizontaly)
            {
                this.body.setVelocityY(this.lastMoveY);
            }
            else
            {
                // Move normaly
                this.body.setVelocityY(this.moveY);
            }

            if (this.moveY > 0) this.playerMovement = PlayerMovement.DOWN
            else if (this.moveY < 0) this.playerMovement = PlayerMovement.UP
        }
    }


    digHere()
    {
        const pixPos = new Phaser.Math.Vector2(this.body.x+1, this.body.y+1);
        this.scene.dig(pixPos);
    }



    rotateSprite()
    {
        if (this.startedGoingRight())
        {
            this.flipX = false;
            this.rotation = 0;
        }
        else if (this.startedGoingLeft())
        {
            this.flipX = true;
            this.rotation = 0;
        }
        else if (this.startedGoingDown())
        {
            if (this.lastPlayerMovement == PlayerMovement.UP) {
                this.flipX = false;
            }
            else
            {
                if (this.lastMoveX > 0)
                    this.rotation = Phaser.Math.PI2 / 4.0;
                else
                    this.rotation = Phaser.Math.PI2 / 4.0 + Phaser.Math.PI2 / 2.0
            }
        }
        else if (this.startedGoingUp())
        {
            if (this.lastPlayerMovement == PlayerMovement.DOWN) 
            {
                this.flipX = true;
            }
            else
            {
                this.rotation = Phaser.Math.PI2 / 4.0 + Phaser.Math.PI2 / 2.0;
            }          
            
        }
    }


    startedGoingRight()
    {
        return this.playerMovement == PlayerMovement.RIGHT &&  this.lastPlayerMovement != PlayerMovement.RIGHT;
    }
    startedGoingLeft()
    {
        return this.playerMovement == PlayerMovement.LEFT &&  this.lastPlayerMovement != PlayerMovement.LEFT;
    }
    startedGoingDown()
    {
        return this.playerMovement == PlayerMovement.DOWN &&  this.lastPlayerMovement != PlayerMovement.DOWN;
    }
    startedGoingUp()
    {
        return this.playerMovement == PlayerMovement.UP &&  this.lastPlayerMovement != PlayerMovement.UP;
    }


    checkDigging()
    {
        const newCell = this.scene.pix2cell(this.body.x, this.body.y);
        if (this.currentCell.x != newCell.x || this.currentCell.y != newCell.y) // Are different cells
        {
            this.currentCell = newCell;

            const standingOnGround = this.scene.isGroundCell(newCell.x, newCell.y);
            if (standingOnGround)
            {
                this.scene.removeGroundCell(newCell.x, newCell.y);
            }
            else
            {
                this.isDigging = false;
            }
        }
    }


}