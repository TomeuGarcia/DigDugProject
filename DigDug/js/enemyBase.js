const EnemyStates = {
    PATROL: 0, 
    GHOST: 1, 
    INFLATED: 2, 
    DYING: 3
}

const MoveDirection = {
    RIGHT: 0,
    UP: 1,
    LEFT: 2,
    DOWN: 3,
    COUNT: 4
}

class enemyBase extends Phaser.GameObjects.Sprite
{
    constructor(_scene, _positionX, _positionY, _spriteTag = 'enemy')
    {
        super(_scene, _positionX, _positionY, _spriteTag);

        _scene.add.existing(this);
        _scene.physics.world.enable(this);

        this.scene = _scene;
        
        this.currentState = EnemyStates.PATROL;
        this.moveDirection = MoveDirection.RIGHT;

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
        super.preUpdate(time, delta);

        this.doCurrentState();
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

    doPatrol()
    {
        if ((this.body.blocked.right || this.body.blocked.left) && 
            (this.moveDirection == MoveDirection.RIGHT || this.moveDirection == MoveDirection.LEFT))
        {
            this.directionX *= -1;
            this.directionY = 0;
            this.body.setVelocityX(gamePrefs.ENEMY_SPEED * this.directionX);
            this.body.setVelocityY(0);
            this.flipX = !this.flipX;
            this.flipY = false;

            this.moveDirection = (this.moveDirection + 1) % MoveDirection.COUNT;
        }
        else if ((this.body.blocked.down || this.body.blocked.up) && 
                (this.moveDirection == MoveDirection.UP || this.moveDirection == MoveDirection.DOWN))
        {
            this.directionX = 0;
            this.directionY *= -1;
            this.body.setVelocityX(0);
            this.body.setVelocityY(gamePrefs.ENEMY_SPEED * this.directionY);
            this.flipX = false;
            this.flipY = !this.flipY;
            
            this.moveDirection = (this.moveDirection + 1) % MoveDirection.COUNT;
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