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
        
        this.currentState = EnemyStates.PATROL;
        this.moveDirection = MoveDirection.RIGHT;

        this.directionX = 1;
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
    }

    preUpdate(time,delta)
    {
        super.preUpdate(time, delta);

        this.doCurrentState();
    }

    hit(_jumper, _hero)
    {
        // Kill player
    }

    doCurrentState()
    {
        switch (this.currentState) {
            case EnemyStates.PATROL:
                this.doPatrol();
                console.log("position: ", this.x, " ", this.y);
                //console.log("patroling ", this.directionX, " ", this.directionY, " position: ", this.x, " ", this.y);
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
            this.directionX *= -1;
            this.directionY = 0;
            this.body.setVelocityX(gamePrefs.ENEMY_SPEED * this.directionX);
            this.body.setVelocityY(0);
            this.flipX = !this.flipX;
            this.flipY = false;

            if (this.moveDirection == MoveDirection.RIGHT)
            {
                this.moveDirection = MoveDirection.LEFT;
            }
            else if (this.moveDirection == MoveDirection.LEFT)
            {
                this.moveDirection = MoveDirection.RIGHT;
            }
            //this.moveDirection = (this.moveDirection + 1) % MoveDirection.COUNT; // DOESN'T WORK
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
            
            if (this.moveDirection == MoveDirection.UP)
            {
                this.moveDirection = MoveDirection.DOWN;
            }
            else if (this.moveDirection == MoveDirection.DOWN)
            {
                this.moveDirection = MoveDirection.UP;
            }
            //this.moveDirection = (this.moveDirection + 1) % MoveDirection.COUNT; // DOESN'T WORK
        }
    }
    // == == ==

    // == GHOST ==
    doGhost()
    {
        // Reomve collisions

        // Check if it leaves an area with collions

    }
    // == == ==

    // == INFLATED ==
    doInflated()
    {
        // Remove movement & start countdown
        this.body.setVelocityX(0);
        this.body.setVelocityY(0);

        // Check inflated amount
        if (this.inflatedAmount >= MAX_INFLATED)
        {
            // Die
            this.currentState = EnemyStates.DYING;
        }
        else if (this.inflatedAmount <= 0)
        {    
            // Reset patrol
            this.inflatedAmount = 0;
            this.resetMovement();
            this.currentState = EnemyStates.PATROL;
        }
    }

    setInfaltedState()
    {
        this.currentState = EnemyStates.INFLATED;
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

    resetMovement()
    {
        switch (this.moveDirection) {
            case this.MoveDirection.RIGHT:
            case this.MoveDirection.LEFT:
                this.body.setVelocityX(gamePrefs.ENEMY_SPEED * this.directionX);
                this.body.setVelocityY(0);
                break;

            case this.MoveDirection.DOWN:
            case this.MoveDirection.UP:
                this.body.setVelocityX(0);
                this.body.setVelocityY(gamePrefs.ENEMY_SPEED * this.directionY);
                break;

            default:
                this.body.setVelocityX(gamePrefs.ENEMY_SPEED * this.directionX);
                this.body.setVelocityY(0);
                break;
        }
    }
}