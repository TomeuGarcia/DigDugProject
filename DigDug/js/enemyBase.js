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
    constructor(_scene, _positionX, _positionY, _spriteTag = 'enemy', _inflatedSpriteTag = 'enemyInflated', 
                _walkingSpriteTag = 'enemyWalking', _ghostSpriteTag = 'enemyGhostign')
    {
        super(_scene, _positionX, _positionY, _spriteTag);

        _scene.add.existing(this);
        _scene.physics.world.enable(this);
        this.body.collideWorldBounds = true;
        this.body.allowGravity = false;

        this.scene = _scene;
        this.spriteTag = _spriteTag;
        this.inflatedSpriteTag = _inflatedSpriteTag;
        this.walkingSpriteTag = _walkingSpriteTag;
        this.ghostSpriteTag = _ghostSpriteTag;
        this.points = 400;
        this.inflatedAmount = 0;
        this.canUnGhost = false;
        this.isDead = false;
        this.canInflate = true;

        this.currentState = EnemyStates.PATROL;
        this.moveDirection = MoveDirection.LEFT;
        this.anims.play(this.walkingSpriteTag, true);

        this.directionX = -1;
        this.directionY = 0;
        this.body.setVelocityX(20 * this.directionX);

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
        this.anims.play(this.walkingSpriteTag, true);

        if (this.body.blocked.right || this.body.blocked.left)
        {
            if (this.moveDirection == MoveDirection.RIGHT)
            {
                var rand = Phaser.Math.Between(1, 4);

                if (rand <= 2)
                {
                    this.moveDirection = MoveDirection.UP;
                    this.trySwitchToGhost();
                    
                    this.directionX = 0;
                    this.directionY = -1;
                    this.body.setVelocityX(0);
                    this.body.setVelocityY(gamePrefs.ENEMY_SPEED * this.directionY);
                    this.flipX = !this.flipX;
                }
                else
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
            else if (this.moveDirection == MoveDirection.LEFT)
            {
                var rand = Phaser.Math.Between(1, 4);

                if (rand <= 2)
                {
                    this.moveDirection = MoveDirection.UP;
                    this.trySwitchToGhost();
                    
                    this.directionX = 0;
                    this.directionY = -1;
                    this.body.setVelocityX(0);
                    this.body.setVelocityY(gamePrefs.ENEMY_SPEED * this.directionY);
                    this.flipX = !this.flipX;
                }
                else
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
        }
        else if (this.body.blocked.down || this.body.blocked.up)
        {
            if (this.moveDirection == MoveDirection.UP)
            {
                var rand = Phaser.Math.Between(1, 4);

                if (rand <= 2)
                {
                    this.moveDirection = MoveDirection.LEFT;
                    this.trySwitchToGhost();
    
                    this.directionX = -1;
                    this.directionY = 0;
                    this.body.setVelocityX(gamePrefs.ENEMY_SPEED * this.directionX);
                    this.body.setVelocityY(0);
                }
                else
                {
                    this.moveDirection = MoveDirection.RIGHT;
                    this.trySwitchToGhost();
    
                    this.directionX = 1;
                    this.directionY = 0;
                    this.body.setVelocityX(gamePrefs.ENEMY_SPEED * this.directionX);
                    this.body.setVelocityY(0);
                }
            }
            else if (this.moveDirection == MoveDirection.DOWN)
            {
                var rand = Phaser.Math.Between(1, 4);

                if (rand <= 2)
                {
                    this.moveDirection = MoveDirection.LEFT;
                    this.trySwitchToGhost();
    
                    this.directionX = -1;
                    this.directionY = 0;
                    this.body.setVelocityX(gamePrefs.ENEMY_SPEED * this.directionX);
                    this.body.setVelocityY(0);
                }
                else
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
    }
    // == == ==

    // == GHOST ==
    doGhost()
    {
        // Play ghost animation
        this.anims.play(this.ghostSpriteTag, true);

        // Reomve collisions
        this.scene.physics.world.removeCollider(this.groundCollider);

        // UnGhost timer        
        this.unGhostTimer = this.scene.time.addEvent({
            delay: 2000,
            callback: this.canRetrunNormal,
            callbackScope: this,
        })

        // Chase player
        if (this.body.x < this.scene.player.x - gamePrefs.HALF_CELL_SIZE)
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

        if (this.body.y < this.scene.player.y - gamePrefs.HALF_CELL_SIZE)
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
        if (this.isInEmptyCell() && this.canUnGhost && 
            (this.scene.canMoveHorizontaly(this.body) || this.scene.canMoveVertically(this.body)))
        {
            // Reset collisions & state
            this.canUnGhost = false;
            this.resetColliders();
            this.resetMovement();
            
            this.tint = 0xffffff;
            this.currentState = EnemyStates.PATROL;

            if (this.body.velocity.x > 0) this.moveDirection == MoveDirection.RIGHT;
            else if (this.body.velocity.x < 0) this.moveDirection == MoveDirection.LEFT;
            else if (this.body.velocity.y > 0) this.moveDirection == MoveDirection.DOWN;
            else if (this.body.velocity.y < 0) this.moveDirection == MoveDirection.UP;
        }
    }

    canRetrunNormal()
    {
        this.canUnGhost = true;
    }

    trySwitchToGhost()
    {
        var rand = Phaser.Math.Between(0, 10);

        if (rand <= 3) { this.currentState = EnemyStates.GHOST; }
    }
    // == == ==

    // == INFLATED ==
    doInflated()
    {
        // Remove movement
        this.body.setVelocityX(0);
        this.body.setVelocityY(0);

        if (this.inflatedAmount > 0)
            this.setFrame(this.inflatedAmount - 1);

        // Check inflated amount
        if (this.inflatedAmount >= MAX_INFLATED)
        {
            this.deflateTimer.remove();

            // Die
            this.currentState = EnemyStates.DYING;
            this.scene.notifyPlayerEnemyDiedInflated();
        }
        else if (this.inflatedAmount <= 0)
        {    
            this.flipX = !this.flipX;
            this.setTexture(this.spriteTag);
            this.inflatedAmount = 0;
            this.deflateTimer.remove(false);
            this.canInflateTimer.remove(false);

            // Reset patrol
            this.resetColliders();
            this.resetMovement();
            this.currentState = EnemyStates.PATROL;

            this.scene.notifyPlayerEnemyReleased();
        }
    }

    isInInflatedState()
    {
        return this.currentState == EnemyStates.INFLATED;
    }

    setInfaltedState()
    {
        if (this.isDead) return;

        this.currentState = EnemyStates.INFLATED;
        this.setTexture(this.inflatedSpriteTag);
        this.flipX = !this.flipX;
        this.tint = 0xffffff;

        // Start countdown
        this.deflateTimer = this.scene.time.addEvent
        ({
            delay: 2000,
            callback: this.decreaseInflation,
            callbackScope: this,
            repeat: -1
        });

        this.canInflateTimer = this.scene.time.addEvent
        ({
            delay: 500,
            callback: this.resetCanInflate,
            callbackScope: this,
            repeat: -1
        });
    }

    addInflation()
    {
        if (this.canInflate)
        {
            this.inflatedAmount++;
            this.canInflate = false;
        }
    }

    decreaseInflation()
    {
        this.inflatedAmount--;
    }

    resetCanInflate()
    {
        this.canInflate = true;
    }
    // == == ==

    // == DIE ==
    doDie()
    {
        if (this.isDead) return;

        this.isDead = true;
        this.deflateTimer.remove(false);

        this.startDespawnTimer();
    }

    killedByRock()
    {
        this.points = this.points * 2;
        this.currentState = EnemyStates.DYING;
    }

    startDespawnTimer()
    {
        this.despawnTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: this.destroySelf,
            callbackScope: this,
        });
    }

    destroySelf()
    {
        this.despawnTimer.remove(false);
        this.canInflateTimer.remove(false);

        // Add points
        this.scene.score += this.points;
        console.log("Score: " + this.scene.score);

        // Reset points value
        this.points = 400;

        // Remove from scene
        this.destroy();
    }
    // == == ==

    // == GENERIC ==
    resetMovement()
    {
        this.anims.play('enemyWalking', true);
        
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

    checkOverlap(spriteA, spriteB) 
    {
        const cellPos = this.scene.pix2cell(~~this.body.x, ~~this.body.y);
        return this.scene.isEmptyCell(cellPos.x, cellPos.y);

	    /*var boundsA = spriteA.getBounds();
	    var boundsB = spriteB.getBounds();
	    return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);*/
	}

    isInEmptyCell()
    {
        const bodyX = ~~this.body.x;
        const bodyY = ~~this.body.y;

        const cellPos = this.scene.pix2cell(bodyX, bodyY);
        return this.scene.isEmptyCell(cellPos.x, cellPos.y);// && this.isInCellCenter(bodyX, bodyY);
    }

    isInCellCenter(_pixX, _pixY)
    {
        return _pixX % gamePrefs.CELL_SIZE == gamePrefs.HALF_CELL_SIZE && _pixY % gamePrefs.CELL_SIZE == gamePrefs.HALF_CELL_SIZE
    }
    // == == ==
}