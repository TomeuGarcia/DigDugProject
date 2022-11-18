


class harpoonVerticalPrefab extends harpoonPrefab
{
    constructor(_scene, _positionX, _positionY, _spriteTag, _playerOwner)
    {
        super(_scene, _positionX, _positionY, _spriteTag);
        this.hide();

        this.moveVel = 0;
    }

    preUpdate(time, delta)
    {
        super.preUpdate(time, delta);

        if (this.body.blocked.down && this.moveVel > 0)
        {
            this.endLifetime();
        }
        else if (this.body.blocked.up && this.moveVel < 0)
        {
            this.endLifetime();
        }

        this.moveVel = this.body.velocity.y;
    }

    getShot(_position, _velocity, _isFlipped)
    {
        super.getShot(_position, _velocity, _isFlipped);

        this.flipY = _isFlipped;

        if (this.flipY) this.setOrigin(0.5, 1);
        else this.setOrigin(0.5, 0);

        this.x = _position.x;
        this.y = _position.y;

        this.body.setVelocityY(_velocity);
    }

}