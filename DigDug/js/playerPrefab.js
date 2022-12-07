
const PlayerMovement = {
    NONE: 0,
    RIGHT: 1,
    LEFT: 2,
    UP: 3,
    DOWN: 4
}

const PlayerStates = {
    MOVING: 0,
    SHOOTING: 1,
    PUMPING: 2,
    SQUISHED: 3,
    DYING: 4
}

class playerPrefab extends Phaser.GameObjects.Sprite
{

    constructor(_scene, _positionX, _positionY, _spriteTag = 'player', _cursors)
    {
        super(_scene, _positionX, _positionY, _spriteTag);

        _scene.add.existing(this);
        _scene.physics.world.enable(this);        

        this.depth = 5;
        this.setScale(1).setOrigin(.5)

        this.scene = _scene;
        this.cursorKeys = _cursors;
        this.moveX = 0;
        this.moveY = 0;
        this.lastMoveX = 0;
        this.lastMoveY = 0;
        this.spriteTag = _spriteTag;

        this.playerMovement = PlayerMovement.RIGHT;
        this.lastPlayerMovement = PlayerMovement.NONE;

        this.squishedSideFrameI = 6;
        this.squishedTopFrameI = 7;
        this.hasHitGroundWhileSquished = false;

        this.score = 0;

        this.currentCell = this.scene.pix2cell(this.body.x, this.body.y);
        this.isDigging = false;

        this.harpoonH = new harpoonHorizontalPrefab(_scene, this.body.x, this.body.y, 'harpoonH', 'maskHarpoonH');
        this.harpoonV = new harpoonVerticalPrefab(_scene, this.body.x, this.body.y, 'harpoonV', 'maskHarpoonV');
        this.alreadyUsedHarpoonInput = false;

        this.playerState = PlayerStates.MOVING;

        this.targetedEnemy = null;

        

        this.respawnTimer = this.scene.time.addEvent({
            delay: 4000,
            callback: this.respawn,
            callbackScope: this,
            repeat: -1
        })
        this.respawnTimer.paused = true;
    }


    preUpdate(time, delta)
    {
        super.preUpdate(time, delta);
        this.getMoveInputs();

        if (this.playerState == PlayerStates.MOVING)
        {
            this.updateMovingState();
        }
        else if (this.playerState == PlayerStates.PUMPING)
        {
            this.updatePumpingState();
            if (this.moveX != 0 || this.moveY != 0) 
            {
                this.quitPumpingToMoving();
            }
        }
        else if (this.playerState == PlayerStates.SQUISHED)
        {
            if (!this.hasHitGroundWhileSquished)
            {
             this.checkSquishedHitGround();   
            }
        }
        else if (this.playerState == PlayerStates.DYING)
        {
            this.body.setVelocityX(0);
            this.body.setVelocityY(0);
        }
    }


    updateMovingState()
    {
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

        if (this.cursorKeys.space.isDown && !this.alreadyUsedHarpoonInput && (this.harpoonH.canBeShoot() && this.harpoonV.canBeShoot()))
        {
            this.shootHarpoon();
            this.alreadyUsedHarpoonInput = true;
        }
        else if (this.cursorKeys.space.isUp)
        {
            this.alreadyUsedHarpoonInput = false;
        }

    }


    getMoveInputs()
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
        const pixPos = this.getCenterPixPos();
        //console.log(pixPos);

        this.scene.dig(pixPos);
    }

    getCenterPixPos()
    {
        return new Phaser.Math.Vector2(this.body.x+1 + gamePrefs.HALF_CELL_SIZE, this.body.y+1 + gamePrefs.HALF_CELL_SIZE);
    }
    getCellPos()
    {
        const pixPos = this.getCenterPixPos();
        return this.scene.pix2cell(pixPos.x, pixPos.y);
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
            this.flipX = true;
            this.rotation = Phaser.Math.PI2 / 4.0 + Phaser.Math.PI2 / 2.0;
        }
        else if (this.startedGoingUp())
        {
            if (this.getCellPos().y > 2)
            {
                this.flipX = false;
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
        const newCell = this.getCellPos();
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



    shootHarpoon()
    {
        this.playerState = PlayerStates.SHOOTING;
        this.anims.pause();
        this.setFrame(14); // shooting frame
        this.body.setVelocityX(0);
        this.body.setVelocityY(0);

        const position = new Phaser.Math.Vector2(this.x, this.y);

        if (this.playerMovement == PlayerMovement.RIGHT || this.playerMovement == PlayerMovement.LEFT)
        {
            const velocity = this.playerMovement == PlayerMovement.RIGHT ? gamePrefs.HARPOON_SPEED : -gamePrefs.HARPOON_SPEED;
            this.harpoonH.setActive(true);
            this.harpoonH.getShot(position, velocity, this.flipX);
        }
        else
        {
            const velocity = this.playerMovement == PlayerMovement.DOWN ? gamePrefs.HARPOON_SPEED : -gamePrefs.HARPOON_SPEED;
            this.harpoonV.setActive(true);
            this.harpoonV.getShot(position, velocity, this.flipX);
        }
    }

    onHarpoonLifetimeEnd()
    {
        this.playerState = PlayerStates.MOVING;
        this.anims.play('playerRun', true);
    }

    onHarpoonHitEnemy(_enemy)
    {
        this.playerState = PlayerStates.PUMPING;
        this.targetedEnemy = _enemy;
        this.alreadyUsedHarpoonInput = false;
        this.anims.play('playerPumping', true);  
    }

    quitPumpingToMoving()
    {
        this.playerState = PlayerStates.MOVING;
        this.harpoonH.hide();
        this.harpoonV.hide();
        this.anims.play('playerRun', true);
    }

    updatePumpingState()
    {
        if (this.cursorKeys.space.isDown && !this.alreadyUsedHarpoonInput)
        {
            this.targetedEnemy.addInflation();
            this.alreadyUsedHarpoonInput = true;

            this.anims.play('playerPumping', true);            
        }
        else if (!this.cursorKeys.space.isDown && this.alreadyUsedHarpoonInput)
        {
            this.alreadyUsedHarpoonInput = false;
        }
    }

    onEnemyGotReleased()
    {
        this.quitPumpingToMoving();
    }

    onEnemyDiedInflated()
    {
        this.quitPumpingToMoving();
    }
    
    die()
    {        
        this.playerState = PlayerStates.DYING;
        this.anims.play('playerDying', true);
        this.respawnTimer.paused = false;

        this.hasHitGroundWhileSquished = false;

        if (true) // TODO no lives left
        {
            this.scene.onPlayerLostAllLives();
        }
    }

    isDead()
    {
        return this.playerState == PlayerStates.DYING;
    }

    respawn()
    {
        this.playerState = PlayerStates.MOVING;
        this.anims.play('playerRun', true);
        this.respawnTimer.paused = true;
    }

    // == SQUISHED ==
    setSquished()
    {        
        if (this.playerState == PlayerStates.SQUISHED || this.playerState == PlayerStates.DYING)
        {
            return;
        } 
        
        this.anims.stop();

        if (this.rotation > 0.01) this.setTexture(this.spriteTag, this.squishedTopFrameI);
        else this.setTexture(this.spriteTag, this.squishedSideFrameI);
        this.rotation = 0;

        this.body.setVelocityX(0);
        this.body.setVelocityY(gamePrefs.ROCK_FALLIN_SPEED);

        this.canGhost = false;
        this.canUnGhost = false;
        this.isDead = false;
        this.isDespawning = false;
        this.canInflate = false; 
        this.isBeingSquished = true;

        this.playerState = PlayerStates.SQUISHED;        

        this.groundCollision = this.scene.physics.add.collider
        (
            this,
            this.scene.digGround
        );
    }

    checkSquishedHitGround()
    {       
        if (this.body.blocked.down)
        {
            this.hasHitGroundWhileSquished = true;
            
            this.removeGroundCollision();
            this.scene.time.delayedCall(800, this.die, [], this);
        }
    }

    removeGroundCollision()
    {
        this.scene.physics.world.removeCollider(this.groundCollision);        
    }

    // == == ==

}