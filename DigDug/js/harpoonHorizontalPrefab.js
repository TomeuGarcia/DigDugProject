


class harpoonHorizontalPrefab extends harpoonPrefab
{
    constructor(_scene, _positionX, _positionY, _spriteTag, _spriteMaskTag)
    {
        super(_scene, _positionX, _positionY, _spriteTag);
        this.hide();

        this.moveVel = 0;

        this.scene.spriteMaskHarpoonH = _scene.add.image(0, 0, _spriteMaskTag).setVisible(false);
        var mask = this.scene.spriteMaskHarpoonH.createBitmapMask();
        this.setMask(mask);
    }

    preUpdate(time, delta)
    {
        super.preUpdate(time, delta);
     
        if (this.body.blocked.right && this.moveVel > 0)
        {
            this.endLifetime();
        }
        else if (this.body.blocked.left && this.moveVel < 0)
        {
            this.endLifetime();
        }

        this.moveVel = this.body.velocity.x;
    }


    getShot(_position, _velocity, _isFlipped)
    {
        super.getShot(_position, _velocity, _isFlipped);

        this.flipX = _isFlipped;

        if (this.flipX) 
        {
            this.setOrigin(0, 0.5);
            this.scene.spriteMaskHarpoonH.setOrigin(1, 0.5);
        }
        else 
        {
            this.setOrigin(1, 0.5);
            this.scene.spriteMaskHarpoonH.setOrigin(0, 0.5);
        }

        this.x = _position.x;
        this.y = _position.y;

        this.scene.spriteMaskHarpoonH.x = _position.x;
        this.scene.spriteMaskHarpoonH.y = _position.y;

        this.body.setVelocityX(_velocity);
    }

    onEnemyOverlap(_harpoon, _enemy)
    {
        super.onEnemyOverlap(_harpoon, _enemy);
    }

}