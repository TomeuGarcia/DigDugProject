
class firePrefab extends Phaser.GameObjects.Sprite
{
    constructor(_scene, _positionX, _positionY, _owner)
    {
        super(_scene, _positionX, _positionY, _owner);

        _scene.add.existing(this);
        _scene.physics.world.enable(this);
        this.body.collideWorldBounds = true;
        this.body.allowGravity = false;

        this.anims.play('fygarFireAttack', true);

        this.scene = _scene;
        this.owner = _owner;

        // Overlap with player
        this.playerOverlap = _scene.physics.add.overlap(
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

        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, 
            function () {
                this.resetToPatrol();
            }, 
            this);
    }

    preUpdate(time, delta)
    {
        super.preUpdate(time, delta);
    }

    hit(_fire, _player)
    {
        if (_player.isDead()) { return; }

        // Kill player
        _player.die();
    }

    startAttack(_fygarPrefab, _posX, _posY, _flip)
    {
        this.owner = _fygarPrefab;
        if (_flip)
        {
            this.setOrigin(1, 0.5);
        }
        else
        {
            this.setOrigin(0, .5);
        }
        this.flipX = _flip;

        this.body.x = _posX;
        this.body.y = _posY;

        this.anims.play('fygarFireAttack', true);
    }

    resetOwnerPatrol()
    {
        this.body.x = config.width + 80;
        this.body.y = config.height + 80;

        this.owner.resetToPatrol();
    }
}