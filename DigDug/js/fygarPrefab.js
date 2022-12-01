
class fygarPrefab extends enemyBase 
{
    constructor(_scene, _positionX, _positionY)
    {
        super(_scene, _positionX, _positionY, 'fygar', 'fygarInflate', 'fygarWalking', 'fygarGhosting');

        this.doingTimer = false;
        this.fire = new firePrefab(_scene, config.width + 80, config.height + 80, this, this.resetToPatrol);
    }

    preUpdate(time, delta)
    {
        super.preUpdate(time, delta);
    }

    doPatrol()
    {
        super.doPatrol();

        this.startTryAttackTimer();
    }

    startTryAttackTimer()
    {
        if (!this.doingTimer)
        {
            var rand = Phaser.Math.Between(4000, 10000);

            this.attackTimer = this.scene.time.addEvent
            ({
                delay: rand,
                callback: this.trySwitchToAttack,
                callbackScope: this,
                repeat: -1
            });

            this.doingTimer = true;
        }
    }

    trySwitchToAttack()
    {
        if (this.doingTimer)
        {        
            this.doingTimer = false;

            if (this.currentState == EnemyStates.PATROL && 
                (this.moveDirection == MoveDirection.LEFT || this.moveDirection == MoveDirection.RIGHT))
            {
                this.currentState = EnemyStates.ATTACKING;
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

        // Wait X time
        /*this.fireTimer = this.scene.time.addEvent
        ({
            delay: 1000,
            callback: this.resetToPatrol,
            callbackScope: this,
            repeat: -1
        });*/
    }

    resetToPatrol(thisFygar)
    {
        console.log(thisFygar);
        console.log(this);

        // Reset to patrol
        this.resetMovement();
        this.currentState = EnemyStates.PATROL;
    }

    resetMovement()
    {
        super.resetMovement();
    }
}