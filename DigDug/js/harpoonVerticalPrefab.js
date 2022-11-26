


class harpoonVerticalPrefab extends harpoonPrefab
{
    constructor(_scene, _positionX, _positionY, _spriteTag, _spriteMaskTag)
    {
        super(_scene, _positionX, _positionY, _spriteTag);
        this.hide();

        this.moveVel = 0;

        this.scene.spriteMaskHarpoonV = _scene.add.image(0, 0, _spriteMaskTag).setVisible(false);
        var mask = this.scene.spriteMaskHarpoonV.createBitmapMask();
        this.setMask(mask);
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

        if (this.flipY) 
        {
            this.setOrigin(0.5, 1);
            this.scene.spriteMaskHarpoonV.setOrigin(0.5, 0);
        }
        else 
        {
            this.setOrigin(0.5, 0);
            this.scene.spriteMaskHarpoonV.setOrigin(0.5, 1);
        }

        this.x = _position.x;
        this.y = _position.y;

        this.scene.spriteMaskHarpoonV.x = _position.x;
        this.scene.spriteMaskHarpoonV.y = _position.y;

        this.body.setVelocityY(_velocity);
    }

    onEnemyOverlap(_harpoon, _enemy)
    {
        console.log("harpoon V overlaps enemy");
        super.onEnemyOverlap(_harpoon, _enemy);        
    }



}