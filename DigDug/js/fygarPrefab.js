
class fygarPrefab extends enemyBase 
{
    constructor(_scene, _positionX, _positionY)
    {
        super(_scene, _positionX, _positionY, 'fygar', 'fygarInflate', 'fygarWalking', 'fygarGhosting');

        this.doingTimer = false;
    }

    preUpdate(time,delta)
    {
        super.preUpdate(time, delta);
    }

    doPatrol()
    {
        super();
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
        this.doingTimer = false;

        if (this.currentState == EnemyStates.PATROL)
        {
            this.currentState = EnemyStates.ATTACKING;
        }
    }

    doAttack()
    {
        // Set velocity to 0
        this.body.setVelocityX(0);
        this.body.setVelocityY(0);

        // Spawn fire in front of fygar

        // Wait X time

        // Reset to patrol
    }
}