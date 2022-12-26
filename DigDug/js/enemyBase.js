const EnemyStates = {
    PAUSED: 0,
    PATROL: 1, 
    GHOST: 2, 
    INFLATED: 3, 
    ATTACKING: 4,
    DYING: 5
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
                _walkingSpriteTag = 'enemyWalking', _ghostSpriteTag = 'enemyGhostign', _squishedFrameI, _points)
    {
        super(_scene, _positionX, _positionY, _spriteTag);

        this.depth = 4;

        _scene.add.existing(this);
        _scene.physics.world.enable(this);
        this.body.collideWorldBounds = true;
        this.body.allowGravity = false;
        this.setOrigin(.5);

        _scene.enemyCount++;

        this.scene = _scene;
        this.spriteTag = _spriteTag;
        this.inflatedSpriteTag = _inflatedSpriteTag;
        this.walkingSpriteTag = _walkingSpriteTag;
        this.ghostSpriteTag = _ghostSpriteTag;
        this.squishedFrameI = _squishedFrameI;
        this.points = _points;
        this.inflatedAmount = 0;
        this.canGhost = false;
        this.canUnGhost = false;
        this.isDead = false;
        this.isDespawning = false;
        this.canInflate = true;    
        this.isBeingSquished = false;
        this.canHitPlayer = true;

        this.moveSpeed = gamePrefs.ENEMY_MIN_SPEED;
        this.ghostMoveSpeed = gamePrefs.ENEMY_MIN_SPEED;

        this.currentState = EnemyStates.PATROL;
        this.moveDirection = MoveDirection.LEFT;
        this.lastDirection = this.moveDirection;

        this.directionX = -1;
        this.directionY = 0;
        this.body.setVelocityX(gamePrefs.ENEMY_MIN_SPEED * this.directionX);

        this.respawnPosition = new Phaser.Math.Vector2(_positionX, _positionY);

        this.desiredVerticalDirection = MoveDirection.DOWN;
        this.exploredLeft = false;
        this.exploredRight = false;
        this.exploredUp = false;
        this.exploredDown = false;

        // Overlap with player
        _scene.physics.add.collider
        (
            this,
            _scene.borders
        );


        this.resetColliders();    

        this.startGhostCooldownTimer();
    }

    initCollisionsWithPlayer()
    {
        this.playerOverlap = this.scene.physics.add.overlap(
            this, 
            this.scene.player,
            this.hit,
            null,
            this
        );
    }

    preUpdate(time,delta)
    {
        super.preUpdate(time, delta);

        if (this.isDead)
        {            
            //if (this.isDespawning) this.setTexture(this.inflatedSpriteTag, 3);
        }
        else
        {
            this.doCurrentState();
            this.updateMoveSpeed(delta);
        }                       
    }

    hit(_enemy, _player)
    {       
        if (!this.canHitPlayer) return;

        if (_player == null) return;
        
        if (_player.isHit) return;

        if (_enemy.currentState == EnemyStates.INFLATED || _enemy.currentState == EnemyStates.DYING) 
        {
            return;
        }        

        const enemyPixPos = _enemy.getCenterPixPos();
        const playerPixPos = _player.getCenterPixPos();
        const distance = enemyPixPos.distance(playerPixPos);

        if (distance > gamePrefs.PLAYER_HIT_DIST)
        {
           return; 
        }

        // Kill player
        _player.die();
    }

    doCurrentState()
    {
        switch (this.currentState) {
            case EnemyStates.PAUSED:
                this.anims.play(this.walkingSpriteTag, true);
                break;
            
            case EnemyStates.PATROL:
                this.doPatrol();
                break;

            case EnemyStates.GHOST:
                this.doGhost();
                break;

            case EnemyStates.INFLATED:
                this.doInflated();
                break;

            case EnemyStates.ATTACKING:
                this.doAttack();
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
        this.setFlip();

        if (this.body.blocked.right || this.body.blocked.left)
        {
            this.changeVerticalDirection();
        }
        else if (this.body.blocked.down || this.body.blocked.up)
        {
            this.changeHorizontalDirection();
        }
    }

    computeNewMoveDir() // UwU I did this for some reason - tomeu
    {
        const cellPos = this.getCellPos();

        var possibleMoveDirections = []
        if (this.moveDirection != MoveDirection.RIGHT && this.scene.canMoveToCell(cellPos.x+1, cellPos.y))
        {
            possibleMoveDirections.push(MoveDirection.RIGHT);
        }
        else if (this.moveDirection != MoveDirection.LEFT && this.scene.canMoveToCell(cellPos.x-1, cellPos.y))
        {
            possibleMoveDirections.push(MoveDirection.LEFT);
        }
        else if (this.moveDirection != MoveDirection.DOWN && this.scene.canMoveToCell(cellPos.x, cellPos.y+1))
        {
            possibleMoveDirections.push(MoveDirection.DOWN);
        }
        else if (this.moveDirection != MoveDirection.UP && this.scene.canMoveToCell(cellPos.x, cellPos.y-1))
        {
            possibleMoveDirections.push(MoveDirection.UP);
        }

        this.moveDirection = possibleMoveDirections[Phaser.Math.Between(0, possibleMoveDirections.length-1)];


        this.setVelocityMatchMoveDirection();
    }

    computeDesiredMove()
    {
        const c = this.scene.canMoveVertically(this.body);
        //console.log(c);
        if (!c) 
        {
            return;
        }


        // set ExploredLeft ExploredRight
        if (this.moveDirection == MoveDirection.LEFT && this.body.blocked.left)
        {
            this.exploredLeft = true;
            this.moveDirection = MoveDirection.RIGHT;
            //this.directionX = 1;
            //this.directionY = 0;
        }
        else if (this.moveDirection == MoveDirection.RIGHT && this.body.blocked.right)
        {
            this.exploredRight = true;
            this.moveDirection = MoveDirection.LEFT;
            //this.directionX = -1;
            //this.directionY = 0;
        }
        else if (this.moveDirection == MoveDirection.DOWN && this.body.blocked.down)
        {
            this.exploredLeft = false;
            this.exploredRight = false;
        }
        else if (this.moveDirection == MoveDirection.UP && this.body.blocked.up)
        {
            this.exploredLeft = false;
            this.exploredRight = false;
        }

        // change desiredVerticalDirection
        if (this.exploredLeft && this.exploredRight)
        {
            if (this.desiredVerticalDirection == MoveDirection.DOWN)
            {
                this.desiredVerticalDirection = MoveDirection.UP;
            }
            else if (this.desiredVerticalDirection == MoveDirection.UP)
            {
                this.desiredVerticalDirection = MoveDirection.DOWN;
            }
        }
        
        // set moveDirection
        const currentCellPos = this.getCellPos();
        if (this.desiredVerticalDirection != this.moveDirection)
        {
            if (this.desiredVerticalDirection == MoveDirection.DOWN)
            {
                if (this.scene.canMoveToCell(currentCellPos.x, currentCellPos.y + 1))
                {
                    console.clear();
                    console.log("can move DOWN");
                    console.log("desire DOWN");
                    //this.directionX = 0;
                    //this.directionY = 1;
    
                    this.exploredLeft = false;
                    this.exploredRight = false;
                    this.lastDirection = this.moveDirection;
                    this.moveDirection = this.desiredVerticalDirection;
                }
            }
            else if (this.desiredVerticalDirection == MoveDirection.UP)
            {
                if (this.scene.canMoveToCell(currentCellPos.x, currentCellPos.y - 1))
                {
                    console.clear();
                    console.log("can move UP");
                    console.log("desire UP");
                    //this.directionX = 0;
                    //this.directionY = -1;
    
                    this.exploredLeft = false;
                    this.exploredRight = false;
                    this.lastDirection = this.moveDirection;
                    this.moveDirection = this.desiredVerticalDirection;
                }
            }
            
        }
        else
        {
            // if moving with desiredVertical and is stopped            
            if (this.body.blocked.up || this.body.blocked.down)
            {
                this.moveDirection = this.lastDirection;
                console.log("tf");
            }            
        }

        this.setVelocityMatchMoveDirection();

        if (this.moveDirection == MoveDirection.RIGHT) console.log("RIGHT");
        else if (this.moveDirection == MoveDirection.LEFT) console.log("LEFT");
        else if (this.moveDirection == MoveDirection.DOWN) {console.log("DOWN"); console.log(this.body.blocked.down); }
        else if (this.moveDirection == MoveDirection.UP) console.log("UP");
    }

    setFlip()
    {
        if (this.moveDirection == MoveDirection.LEFT)
            this.flipX = true;
        else if (this.moveDirection == MoveDirection.RIGHT)
            this.flipX = false;
    }

    changeVerticalDirection()
    {
        if (this.trySwitchToGhost()) return;

        const playerY = this.scene.player.getCenterPixPos().y;
        const enemyY = this.getCenterPixPos().y;

        var dir = playerY < enemyY ? -1 : 1;
        const cellPos = this.getCellPos();

        const canChasePlayer = this.scene.canMoveToCell(cellPos.x, cellPos.y + dir);
        if (!canChasePlayer) dir *= -1;

        //var rand = Phaser.Math.Between(1, 4);
        //if (rand <= 2)

        this.moveDirection = dir <= 0 ? MoveDirection.UP : MoveDirection.DOWN;
        this.setVelocityMatchMoveDirection();
    }

    changeHorizontalDirection()
    {
        if (this.trySwitchToGhost()) return;

        const playerX = this.scene.player.getCenterPixPos().x;
        const enemyX = this.getCenterPixPos().x;

        var dir = playerX < enemyX ? -1 : 1;
        const cellPos = this.getCellPos();

        const canChasePlayer = this.scene.canMoveToCell(cellPos.x + dir, cellPos.y);
        if (!canChasePlayer) dir *= -1;

        //var rand = Phaser.Math.Between(1, 4);
        //if (rand <= 2)

        this.moveDirection = dir <= 0 ? MoveDirection.LEFT : MoveDirection.RIGHT;
        this.setVelocityMatchMoveDirection();
    }
    // == == ==

    // == GHOST ==
    doGhost()
    {
        if (!this.canGhost) { return; }

        // Play ghost animation
        this.anims.play(this.ghostSpriteTag, true);

        // Remove collisions
        this.scene.physics.world.removeCollider(this.groundCollider);
        this.groundCollider = null;

        // UnGhost timer        
        this.unGhostTimer = this.scene.time.addEvent({
            delay: 2000,
            callback: this.canRetrunNormal,
            callbackScope: this,
        })

        // Chase player
        if (this.scene.player.playerState != PlayerStates.DYING)
        {
            this.setMoveDirectionTowardsPlayer();
            const enemyToPlayer = this.getDirectionTowardsPlayer();
            const enemyToPlayerVelocity = enemyToPlayer.setLength(this.ghostMoveSpeed);
    
            this.body.setVelocityX(enemyToPlayerVelocity.x);
            this.body.setVelocityY(enemyToPlayerVelocity.y);
        }

        // Check if it leaves an area with collisions
        if (this.canQuitGhost())
        {            
            this.quitGhost();
        }        
    }

    canQuitGhost()
    {
        if (!this.canUnGhost) return false;
        if (!this.isInEmptyCell()) return false;

        //if (!this.scene.canMoveHorizontaly(this.body) && !this.scene.canMoveVertically(this.body)) return false;

        const cellPos = this.getCellPos();
        if (this.scene.cell2pix(cellPos.x, cellPos.y).distance(this.getCenterPixPos()) <= 6)
        {
            return true;
        }
        
        return false;
    }

    canRetrunNormal() { this.canUnGhost = true; }

    quitGhost()
    {
        // Reset collisions & state
        this.canUnGhost = false;
        this.resetColliders();
        this.resetMovement();
        
        this.tint = 0xffffff;
        this.currentState = EnemyStates.PATROL;

        const cellPos = this.getCellPos();
        const cellPixPos = this.scene.cell2pix(cellPos.x, cellPos.y);
        this.x = cellPixPos.x;
        this.y = cellPixPos.y;

        this.setVelocityMatchMoveDirection();
    }

    allowGhost() 
    { 
        this.cooldownGhostTimer.remove(false);
        this.canGhost = true;
    }

    trySwitchToGhost()
    {
        var rand = Phaser.Math.Between(0, 10);

        if (rand <= 3 && this.canGhost) 
        { 
            this.currentState = EnemyStates.GHOST;
            return true; 
        }

        return false;
    }

    startGhostCooldownTimer()
    {
        if (!this.canGhost)
        {
            this.cooldownGhostTimer = this.scene.time.addEvent({
                delay: 3000,
                callback: this.allowGhost,
                callbackScope: this
            });  
        }
    }
    // == == ==

    // == INFLATED ==
    doInflated()
    {
        // Remove movement
        this.body.setVelocityX(0);
        this.body.setVelocityY(0);

        if (this.inflatedAmount > 0)
            this.setTexture(this.inflatedSpriteTag, this.inflatedAmount - 1);

        // Check inflated amount
        if (this.inflatedAmount >= MAX_INFLATED)
        {
            this.deflateTimer.remove();
            this.setTexture(this.inflatedSpriteTag, 3);

            // Play audio
            this.scene.enemyBlowUp.play();

            // Die
            this.currentState = EnemyStates.DYING;
            this.scene.notifyPlayerEnemyDiedInflated();
        }
        else if (this.inflatedAmount <= 0)
        {
            this.setTexture(this.spriteTag);
            this.inflatedAmount = 0;
            this.deflateTimer.remove(false);
            this.canInflateTimer.remove(false);

            // Reset patrol
            this.resetColliders();
            this.resetMovement();
            this.currentState = EnemyStates.PATROL;
            this.canHitPlayer = true;

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

        this.canGhost = false;
        this.currentState = EnemyStates.INFLATED;
        this.canHitPlayer = false;

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
            delay: 300,
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

    // == ATTACK ==
    doAttack() {}
    // == == ==


    // == SQUISHED ==
    setSquished()
    {        
        if (this.currentState == EnemyStates.DYING)
        {
            return;
        } 

        if (this.currentState == EnemyStates.GHOST)
        {
            this.quitGhost();
        }
     
        this.anims.stop();
        this.setTexture(this.spriteTag, this.squishedFrameI);

        this.body.setVelocityX(0);
        this.body.setVelocityY(gamePrefs.ROCK_FALLIN_SPEED);

        this.canGhost = false;
        this.canUnGhost = false;
        this.isDead = false;
        this.isDespawning = false;
        this.canInflate = false; 
        this.isBeingSquished = true;

        this.killedByRock();
    }

    killedByRock()
    {   
        // Stop audio
        this.scene.fygarFire.stop();
        
        // Play audio
        this.scene.enemySquashed.play();

        this.points *= 2;
        this.currentState = EnemyStates.DYING;
    }
    // == == ==


    // == DIE ==
    doDie()
    {
        if (this.isDead) return;

        this.isDead = true;
        this.anims.stop();
        if (this.deflateTimer != null) this.deflateTimer.remove(false);

        this.startDespawnTimer();
    }

    startDespawnTimer()
    {
        this.playerOverlap.destroy();

        this.isDespawning = true;
        this.despawnTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: this.destroySelf,
            callbackScope: this,
        });
    }

    destroySelf()
    {
        this.despawnTimer.remove(false);
        if (this.canInflateTimer != null) this.canInflateTimer.remove(false);
        if (this.cooldownGhostTimer != null) this.cooldownGhostTimer.remove(false);

        // Add points
        this.scene.addScore(this.points, this.x, this.y);
        
        // Check if won
        this.scene.enemyCount--;
        this.scene.checkIfWon();

        // Remove from scene
        this.destroy();
    }
    // == == ==

    // == RESPAWN ==
    respawn()
    {
        if (this.currentState == EnemyStates.GHOST)
        {
            this.quitGhost();
        }

        this.setPaused();

        this.scene.time.delayedCall(2000, this.resetPatrol, [], this);
    }

    setPaused()
    {
        this.currentState = EnemyStates.PAUSED;

        this.x = this.respawnPosition.x;
        this.y = this.respawnPosition.y;
        this.body.setVelocityX(0);
        this.body.setVelocityY(0);
    }

    resetPatrol()
    {
        this.currentState = EnemyStates.PATROL;
        this.computeNewMoveDir();
    }
    // == == ==

    // == GENERIC ==
    getDirectionTowardsPlayer()
    {
        const playerPos = this.scene.player.getCenterPixPos();
        const enemyPos = this.getCenterPixPos();
        return playerPos.subtract(enemyPos).normalize();
    }


    setMoveDirectionTowardsPlayer()
    {
        const enemyToPlayer = this.getDirectionTowardsPlayer();
        const dirThreshold = 0.9;

        if (enemyToPlayer.dot(new Phaser.Math.Vector2(1, 0)) > dirThreshold) this.moveDirection = MoveDirection.RIGHT;
        else if (enemyToPlayer.dot(new Phaser.Math.Vector2(-1, 0)) > dirThreshold) this.moveDirection = MoveDirection.LEFT;
        else if (enemyToPlayer.dot(new Phaser.Math.Vector2(0, -1)) > dirThreshold) this.moveDirection = MoveDirection.UP;
        else if (enemyToPlayer.dot(new Phaser.Math.Vector2(0, 1)) > dirThreshold) this.moveDirection = MoveDirection.DOWN;
        else this.moveDirection = MoveDirection.RIGHT;
    }

    setVelocityMatchMoveDirection()
    {
        this.directionX = 0;
        this.directionY = 0;

        if (this.moveDirection == MoveDirection.RIGHT) this.directionX = 1;
        else if (this.moveDirection == MoveDirection.LEFT) this.directionX = -1;
        else if (this.moveDirection == MoveDirection.UP) this.directionY = -1;
        else if (this.moveDirection == MoveDirection.DOWN) this.directionY = 1;
        else this.directionX = 1;

        this.body.setVelocityX(this.moveSpeed * this.directionX);
        this.body.setVelocityY(this.moveSpeed * this.directionY);
    }


    resetMovement()
    {
        if (this.currentState == EnemyStates.DYING) return;
        this.anims.play(this.walkingSpriteTag, true);

        this.setMoveDirectionTowardsPlayer();
        this.setVelocityMatchMoveDirection();
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
        const cellPos = this.getCellPos();
        return this.scene.isEmptyCell(cellPos.x, cellPos.y);// && this.isInCellCenter(bodyX, bodyY);
    }

    isInCellCenter(_pixX, _pixY)
    {
        return _pixX % gamePrefs.CELL_SIZE == gamePrefs.HALF_CELL_SIZE && 
               _pixY % gamePrefs.CELL_SIZE == gamePrefs.HALF_CELL_SIZE
    }
    
    
    getCenterPixPos()
    {
        return new Phaser.Math.Vector2(this.body.x + this.body.width / 2, this.body.y + this.body.height / 2);
    }  
    
    getCellPos()
    {
        const pixPos = this.getCenterPixPos();
        return this.scene.pix2cell(pixPos.x, pixPos.y);
    }

    updateMoveSpeed(_delta)
    {
        if (this.moveSpeed >= gamePrefs.ENEMY_MAX_SPEED) return;

        const step = (_delta * 0.001) / gamePrefs.ENEMY_SPEED_INC_SPAN_SECONDS * (gamePrefs.ENEMY_MAX_SPEED - gamePrefs.ENEMY_MIN_SPEED);      
        this.moveSpeed = Phaser.Math.Clamp(this.moveSpeed + step, gamePrefs.ENEMY_MIN_SPEED, gamePrefs.ENEMY_MAX_SPEED);
    }

    // == == ==



}