


class harpoonPrefab extends Phaser.GameObjects.Sprite
{
    constructor(_scene, _positionX, _positionY, _spriteTag, _lifetime = 550)
    {
        super(_scene, _positionX, _positionY, _spriteTag);

        _scene.add.existing(this);
        _scene.physics.world.enable(this);


        this.lifetimeTimer = _scene.time.addEvent(
            {
                delay: _lifetime,
                callback: this.endLifetime,
                callbackScope: this,
                repeat: -1
            }
        );

        this.useTimer = _scene.time.addEvent(
            {
                delay: _lifetime,
                callback: this.setCanBeUsed,
                args: [true],
                callbackScope: this,
                repeat: -1
            }
        );

        _scene.physics.add.collider
        (
            this,
            _scene.borders
        );
        
        _scene.physics.add.collider
        (
            this,
            _scene.digGround
        );

        this.isBeingShot = false;
    }

    preUpdate(time, delta)
    {
        super.preUpdate(time, delta);
    }


    getShot(_position, _velocity, _isFlipped)
    {
        this.setVisible(true);
        this.lifetimeTimer.paused = false;
        this.useTimer.paused = false;
        
        this.isBeingShot = true;
        this.setCanBeUsed(false);
    }


    endLifetime()
    {
        this.hide();

        this.isBeingShot = false;

        this.scene.player.onHarpoonLifetimeEnd();
    }

    setCanBeUsed(_canBeUsed)
    {
        this.canBeUsed = _canBeUsed;
    }

    hide()
    {
        this.lifetimeTimer.paused = true;
        this.setActive(false);

        this.y = -100;
        this.body.setVelocityY(0);
        this.body.setVelocityX(0);
    }


    canBeShoot()
    {
        return this.canBeUsed;
    }

    onCollideDigGround(_digGround, _thisHarpoon)
    {
        this.endLifetime();
    }

}