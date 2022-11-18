


class harpoonHorizontalPrefab extends harpoonPrefab
{
    constructor(_scene, _positionX, _positionY, _spriteTag , _playerOwner)
    {
        super(_scene, _positionX, _positionY, _spriteTag);
    }

    getShot(_position, _velocity, _isFlipped)
    {
        this.flipX = _isFlipped;

        if (this.flipX) this.setOrigin(0, 0.5);
        else this.setOrigin(1, 0.5);

        this.x = _position.x;
        this.y = _position.y;

        this.body.setVelocityX(_velocity);
    }



}