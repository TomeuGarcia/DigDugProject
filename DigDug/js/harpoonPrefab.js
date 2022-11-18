


class harpoonPrefab extends Phaser.GameObjects.Sprite
{
    constructor(_scene, _positionX, _positionY, _spriteTag, _playerOwner)
    {
        super(_scene, _positionX, _positionY, _spriteTag);

        _scene.add.existing(this);
        _scene.physics.world.enable(this);
    }

    getShot(_position, _velocity, _isFlipped)
    {
        /*
        this.x = _position.x;
        this.y = _position.y;

        this.flipX = _flipX;
        this.rotation = _rotation;

        this.body.setVelocityX(_velocity.x);
        this.body.setVelocityY(_velocity.y);
        */
    }



}