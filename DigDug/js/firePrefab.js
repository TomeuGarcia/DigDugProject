
class firePrefab extends Phaser.GameObjects.Sprite
{
    constructor(_scene, _positionX, _positionY, _owner, _ownerEndAttackCallback)
    {
        super(_scene, _positionX, _positionY);

        _scene.add.existing(this);
        _scene.physics.world.enable(this);
        this.body.collideWorldBounds = true;
        this.body.allowGravity = false;

        this.anims.play('fygarFireAttack', true);

        this.scene = _scene;
        this.owner = _owner;
        this.ownerEndAttackCallback = _ownerEndAttackCallback;
        
        this.fireSequence = [];
        this.fireSequence.push(this.scene.add.sprite('fireSmall'));
        this.fireSequence.push(this.scene.add.sprite('fireMedium'));
        this.fireSequence.push(this.scene.add.sprite('fireBig'));
        this.fireSequenceIndex = 0;
        

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
                this.resetOwnerPatrol();
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

    startAttack(_posX, _posY, _flip)
    {
        if (_flip)
        {
            this.setOrigin(1, 0.5);
            _posX -= gamePrefs.HALF_CELL_SIZE;
        }
        else
        {
            this.setOrigin(0, .5);
            _posX += gamePrefs.HALF_CELL_SIZE;
        }
        this.flipX = _flip;

        this.visible = true;
        this.setActive(true);

        this.x = _posX;
        this.y = _posY;

        this.anims.play('fygarFireAttack', true);
    }

    resetOwnerPatrol()
    {
        this.visible = false;
        this.setActive(false);
        this.ownerEndAttackCallback(this.owner);
    }
}