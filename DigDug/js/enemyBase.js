const EnemyStates = {
    PATROL: 0, 
    GHOST: 1, 
    INFLATED: 2, 
    DYING: 3
};

const MoveDirection = {
    RIGHT: 0,
    UP: 1,
    LEFT: 2,
    DOWN: 3,
    COUNT: 4
};

const MAX_INFLATED = 4;

class enemyBase extends Phaser.GameObjects.Sprite
{
    constructor(_scene, _positionX, _positionY, _spriteTag = 'enemy')
    {
        super(_scene, _positionX, _positionY, _spriteTag);

        _scene.add.existing(this);
        _scene.physics.world.enable(this);
        this.body.collideWorldBounds = true;
        this.body.allowGravity = false;

        this.scene = _scene;
        this.points = 100;
        this.inflatedAmount = 0;
        this.canUnGhost = false;
        
        //this.currentState = EnemyStates.GHOST;
        this.currentState = EnemyStates.PATROL;
        this.moveDirection = MoveDirection.LEFT;

        this.directionX = -1;
        this.directionY = 0;
        this.body.setVelocityX(20 * this.directionX);
        //this.body.setVelocityY(20 * this.directionY);

        // Overlap with player
        _scene.physics.add.overlap(
            this, 
            _scene.player,
            this.hit,
            null,
            this
        );
        
        _scene.physics.add.collider
        (
            this,
            _scene.borders
        );

        this.groundCollider = _scene.physics.add.collider
        (
            this,
            _scene.digGround
        );
    }

    preUpdate(time,delta)
    {
        super.preUpdate(time, delta);

        this.doCurrentState();
    }

    hit(_jumper, _hero)
    {
        // Kill player
        _hero.anims.play('playerDying', true);
    }

    doCurrentState()
    {
        switch (this.currentState) {
            case EnemyStates.PATROL:
                this.doPatrol();
                break;

            case EnemyStates.GHOST:
                this.doGhost();
                break;

            case EnemyStates.INFLATED:
                this.doInflated();
                break;

            case EnemyStates.DYING:
                this.doDie();
                break;
        
            default:
                break;
        }
    }

    // == PATROL ==
    doPatrol()
    {
        if ((this.body.blocked.right || this.body.blocked.left) && 
            (this.moveDirection == MoveDirection.RIGHT || this.moveDirection == MoveDirection.LEFT))
        {
            if (this.moveDirection == MoveDirection.RIGHT)
            {
                this.moveDirection = MoveDirection.UP;
                this.trySwitchToGhost();
                
                this.directionX = 0;
                this.directionY = -1;
                this.body.setVelocityX(0);
                this.body.setVelocityY(gamePrefs.ENEMY_SPEED * this.directionY);
                this.flipX = !this.flipX;
            }
            else if (this.moveDirection == MoveDirection.LEFT)
            {
                this.moveDirection = MoveDirection.DOWN;
                this.trySwitchToGhost();

                this.directionX = 0;
                this.directionY = 1;
                this.body.setVelocityX(0);
                this.body.setVelocityY(gamePrefs.ENEMY_SPEED * this.directionY);
                this.flipX = !this.flipX;
            }
        }
        else if ((this.body.blocked.down || this.body.blocked.up) && 
                (this.moveDirection == MoveDirection.UP || this.moveDirection == MoveDirection.DOWN))
        {
            if (this.moveDirection == MoveDirection.UP)
            {
                this.moveDirection = MoveDirection.LEFT;
                this.trySwitchToGhost();

                this.directionX = -1;
                this.directionY = 0;
                this.body.setVelocityX(gamePrefs.ENEMY_SPEED * this.directionX);
                this.body.setVelocityY(0);
            }
            else if (this.moveDirection == MoveDirection.DOWN)
            {
                this.moveDirection = MoveDirection.RIGHT;
                this.trySwitchToGhost();

                this.directionX = 1;
                this.directionY = 0;
                this.body.setVelocityX(gamePrefs.ENEMY_SPEED * this.directionX);
                this.body.setVelocityY(0);
            }
        }
    }
    // == == ==

    // == GHOST ==
    doGhost()
    {
        // Reomve collisions
        this.scene.physics.world.removeCollider(this.groundCollider);

        // UnGhost timer        
        this.unGhostTimer = this.scene.time.addEvent({
            delay: 2000,
            callback: this.canRetrunNormal,
            callbackScope: this,
        })

        // Chase player
        if (this.body.x < this.scene.player.x)
        {
            this.body.setVelocityX(gamePrefs.ENEMY_SPEED);
        }
        else if (this.body.x > this.scene.player.x)
        {
            this.body.setVelocityX(-gamePrefs.ENEMY_SPEED);
        }
        else
        {
            this.body.setVelocityX(0);
        }

        if (this.body.y < this.scene.player.y)
        {
            this.body.setVelocityY(gamePrefs.ENEMY_SPEED);
        }
        else if (this.body.y > this.scene.player.y)
        {
            this.body.setVelocityY(-gamePrefs.ENEMY_SPEED);
        }
        else
        {
            this.body.setVelocityY(0);
        }

        // Check if it leaves an area with collions
        if (!this.checkOverlap(this, this.scene.digGround) && this.canUnGhost && 
            (this.scene.canMoveHorizontaly(this.body) || this.scene.canMoveVertically(this.body)))
        {
            // Reset collisions & state
            this.canUnGhost = false;
            this.resetColliders();
            this.resetMovement();
            
            this.tint = 0xffffff;
            this.currentState = EnemyStates.PATROL;
        }
    }

    canRetrunNormal()
    {
        this.canUnGhost = true;
    }

    trySwitchToGhost()
    {
        var rand = Phaser.Math.Between(0, 10);

        if (rand <= 3)
        {
            this.currentState = EnemyStates.GHOST;
            this.tint = 0x999999;
        }
    }
    // == == ==

    // == INFLATED ==
    doInflated()
    {
        // Remove movement
        this.body.setVelocityX(0);
        this.body.setVelocityY(0);

        // Check inflated amount
        if (this.inflatedAmount >= MAX_INFLATED)
        {
            this.deflateTimer.remove();

            // Die
            this.currentState = EnemyStates.DYING;
        }
        else if (this.inflatedAmount <= 0)
        {    
            this.inflatedAmount = 0;
            this.deflateTimer.remove();

            // Reset patrol
            this.resetColliders();
            this.resetMovement();
            this.currentState = EnemyStates.PATROL;
        }
    }

    isInInflatedState()
    {
        return this.currentState == EnemyStates.INFLATED;
    }

    setInfaltedState()
    {
        this.currentState = EnemyStates.INFLATED;

        // Start countdown
        this.deflateTimer = this.scene.time.addEvent({
            delay: 2000,
            callback: this.decreaseInflation,
            callbackScope: this,
            repeat: -1
        })
    }

    addInflation()
    {
        this.inflatedAmount++;
    }

    decreaseInflation()
    {
        this.inflatedAmount--;
    }
    // == == ==

    // == DIE ==
    doDie()
    {
        // Add points
        this.scene.score += this.points;
        console.log("Score: " + this.scene.score);

        // Reset points value
        this.points = 100;

        // Remove from scene
        this.destroy();
    }

    killedByRock()
    {
        this.points = 200;
        this.currentState = EnemyStates.DYING;
    }
    // == == ==

    // == GENERIC ==
    resetMovement()
    {
        switch (this.moveDirection) {
            case MoveDirection.RIGHT:
            case MoveDirection.LEFT:
                this.body.setVelocityX(gamePrefs.ENEMY_SPEED * this.directionX);
                this.body.setVelocityY(0);
                break;

            case MoveDirection.DOWN:
            case MoveDirection.UP:
                this.body.setVelocityX(0);
                this.body.setVelocityY(gamePrefs.ENEMY_SPEED * this.directionY);
                break;

            default:
                this.body.setVelocityX(gamePrefs.ENEMY_SPEED * this.directionX);
                this.body.setVelocityY(0);
                break;
        }
    }

    resetColliders()
    {
        this.groundCollider = this.scene.physics.add.collider
        (
            this,
            this.scene.digGround
        );
    }

    checkOverlap(spriteA, spriteB) {
	    var boundsA = spriteA.getBounds();
	    var boundsB = spriteB.getBounds();
	    return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
	}
    // == == ==
}