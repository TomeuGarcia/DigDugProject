
class fygarPrefab extends enemyBase 
{
    constructor(_scene, _positionX, _positionY, _spriteTag = 'fygar', _inflatedSpriteTag = 'fygarInflate', 
                _walkingSpriteTag = 'fygarWalking', _ghostSpriteTag = 'fygarGhosting', _points)
    {
        super(_scene, _positionX, _positionY, _spriteTag, _inflatedSpriteTag, _walkingSpriteTag, _ghostSpriteTag, _points);

        this.doingTimer = false;
        this.fire = new firePrefab(_scene, config.width + 80, config.height + 80, this, this.resetToPatrol);

        this.attackTimer = this.scene.time.addEvent
        ({
            delay: 10000,
            callback: this.trySwitchToAttack,
            callbackScope: this,
            repeat: -1
        });

    }

    preUpdate(time, delta)
    {
        super.preUpdate(time, delta);
    }    
    
    initCollisionsWithPlayer()
    {
        super.initCollisionsWithPlayer();

        this.fire.initFireCollisionsWithPlayer();
    }

    doPatrol()
    {
        super.doPatrol();

        if (!this.doingTimer && this.currentState != EnemyStates.ATTACKING)
        {
            this.startTryAttackTimer();
        }        
    }

    startTryAttackTimer()
    {
        var rand = Phaser.Math.Between(4000, 10000);

        this.attackTimer.reset({
            delay: rand,
            callback: this.trySwitchToAttack,
            callbackScope: this,
            repeat: -1
        });
        
        this.doingTimer = true;
    }

    trySwitchToAttack()
    {
        if (this.doingTimer)
        {        
            if (this.currentState == EnemyStates.PATROL && 
                (this.moveDirection == MoveDirection.LEFT || this.moveDirection == MoveDirection.RIGHT))
            {
                this.currentState = EnemyStates.ATTACKING;
                this.attackTimer.pused = true;
            }
        }
    }

    doAttack()
    {
        // Set velocity to 0
        this.body.setVelocityX(0);
        this.body.setVelocityY(0);

        // Change animation
        this.anims.play('fygarAttacking', true);

        // Spawn fire in front of fygar
        const pos = this.getCenterPixPos();
        this.fire.startAttack(pos.x, pos.y, this.flipX);
    }

    resetToPatrol(thisFygar)
    {        
        thisFygar.doingTimer = false;

        // Reset to patrol
        thisFygar.resetMovement();
        thisFygar.currentState = EnemyStates.PATROL;
    }

    resetMovement()
    {
        super.resetMovement();
    }
}