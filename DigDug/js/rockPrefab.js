class rockPrefab extends Phaser.GameObjects.Sprite
{
    constructor(_scene, _positionX, _positionY, _spriteTag = 'rock')
    {
        super(_scene, _positionX, _positionY, _spriteTag);
        this.hasHitGround = false;
        this.isFalling = false;
        _scene.add.existing(this);
        _scene.physics.world.enable(this);        
        this.scene = _scene;
        this.cellBelow = this.scene.pix2cell(_positionX,_positionY+gamePrefs.CELL_SIZE);
        this.body.immovable = true;

        this.rockCollider = null;

        this.body.setSize(16, 16);
    }
    
    preUpdate(time, delta)
    {
        super.preUpdate(time,delta);
        if(this.isFalling)
        {
            if(this.body.blocked.down && !this.hasHitGround)
            {
                this.hasHitGround = true;
                this.anims.play('rockDestroy',true);
                this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, 
                    function () {
                        this.destroyRock();
                    }, 
                    this);
            }
            return;
        } 

        if(this.scene.isEmptyCell(this.cellBelow.x,this.cellBelow.y))
        {
            this.isFalling = true;
        
            this.anims.play('rockStartFalling',true);
            this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, 
                function () {
                    this.startFalling();
                    
                }, 
                this);
        }

        //this.scene.add.rectangle(this.x-.5, this.y-.5, 10, 10, 0x9966ff);
    }

    startFalling()
    {
        this.body.immovable = false;
        this.body.setVelocityY(gamePrefs.ROCK_FALLIN_SPEED);
        this.scene.physics.add.overlap(
            this,
            this.scene.enemyGroup,
            this.squishEnemy,
            null,
            this
        );

        this.scene.physics.add.overlap(
            this,
            this.scene.player,
            this.squishPlayer,
            null,
            this
        );

        this.scene.removeRockCollisions(this.rockCollider);
    }

    destroyRock()
    {
        this.visible = false;
        this.setActive(false);
        this.y = -100;
        this.body.setVelocityY(0);
    }

    squishEnemy(rock, enemy)
    {
        if (this.hasHitGround) return;

        rock.scene.squishEnemy(enemy);
    }

    squishPlayer(rock, player)
    {
        if (this.hasHitGround) return;

        console.log(player.x, rock.x);

        if (player.y < rock.y && ((player.x > rock.x -8) || (player.x < rock.x +8))) return;
        rock.scene.squishPlayer();
    }

    setColliderReference(_rockCollider)
    {
        this.rockCollider = _rockCollider;
    }

}