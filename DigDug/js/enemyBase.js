class enemyBase extends Phaser.GameObjects.Sprite
{
    constructor(_scene, _positionX, _positionY, _spriteTag = 'enemy')
    {
        super(_scene, _positionX, _positionY, _spriteTag);

        _scene.add.existing(this);
        _scene.physics.world.enable(this);

        this.scene = _scene;
        
        this.states = { PATROL, GHOST, INFLATED, DYING };
        this.currentState = this.states.PATROL;

        this.directionX = 1;
        this.directionY = 0;

        // Overlap with player
        _scene.physics.add.overlap(
            this, 
            _scene.player,
            this.hit,
            null,
            this
        );
    }

    preUpdate(time,delta)
    {        
        switch (this.currentState) {
            case PATROL:
                doPatrol();
                break;

            case GHOST:
                doGhost();
                break;

            case INFLATED:
                doInflated();
                break;

            case DYING:
                this.doDie();
                break;
        
            default:
                break;
        }

        super.preUpdate(time, delta);
    }

    doPatrol()
    {
        if (this.body.blocked.right)
        {
            this.directionX = -1;
            this.directionY = 0;
            this.body.setVelocityX(gamePrefs.ENEMY_SPEED * this.directionX);
            this.body.setVelocityY(0);
            this.flipX = !this.flipX;
            this.flipY = false;
        }
        else if (this.body.blocked.left)
        {
            this.directionX = 1;
            this.directionY = 0;
            this.body.setVelocityX(gamePrefs.ENEMY_SPEED * this.directionX);
            this.body.setVelocityY(0);
            this.flipX = !this.flipX;
            this.flipY = false;
        }
        else if (this.body.blocked.down)
        {
            this.directionX = 0;
            this.directionY = -1;
            this.body.setVelocityX(0);
            this.body.setVelocityY(gamePrefs.ENEMY_SPEED * this.directionY);
            this.flipX = false;
            this.flipY = !this.flipY;
        }
        else if (this.body.blocked.up)
        {
            this.directionX = 0;
            this.directionY = 1;
            this.body.setVelocityX(0);
            this.body.setVelocityY(gamePrefs.ENEMY_SPEED * this.directionY);
            this.flipX = false;
            this.flipY = !this.flipY;
        }
    }

    doGhost()
    {
        // Reomve gravity & collisions

        // Check if it leaves an area with collions

    }

    doInflated()
    {
        // Remove movement & start countdown

        // Get inflated || get uninflated

        // Die || Patrol
    }

    doDie()
    {
        // Add points

        // Remove from scene

    }

    hit(_jumper, _hero)
    {
        // Kill player
    }
}