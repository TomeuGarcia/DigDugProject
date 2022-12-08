

class fruitPrefab extends Phaser.GameObjects.Sprite
{
    constructor(_scene, _positionX, _positionY, _spriteTag, _spriteSheetIndex, _points)
    {
        super(_scene, _positionX, _positionY, _spriteTag);

        _scene.add.existing(this);
        _scene.physics.world.enable(this);    

        this.setTexture(_spriteTag, _spriteSheetIndex);
        this.depth = 1;

        this.points = _points;
    }

    preUpdate(time, delta)
    {

    }

    enable(_positionX, _positionY)
    {
        this.x = _positionX;
        this.y = _positionY;

        this.setActive(true);
        this.visible = true;
        this.body.checkCollision.none = false;
    }

    disable()
    {
        this.setActive(false);
        this.visible = false;
        this.body.checkCollision.none = true;
    }

}