class rockPrefab extends Phaser.GameObjects.Sprite
{
    constructor(_scene, _positionX, _positionY, _spriteTag = 'rock')
    {
        super(_scene, _positionX, _positionY, _spriteTag);
   
        _scene.add.existing(this);
        _scene.physics.world.enable(this);        
        this.scene = _scene;
        this.cellBelow = this.scene.pix2cell(_positionX,_positionY+gamePrefs.CELL_SIZE);
        this.scene.physics.add.collider
        (
            this,
            this.borders
        );
    }
    preUpdate(time, delta)
    {
        if(this.isFalling) return;

        if(this.scene.isEmptyCell(this.cellBelow.x,this.cellBelow.y)){
            this.isFalling = true;
            this.scene.physics.add.overlap(
                this,
                this.scene.enemyGroup,
                this.squishEnemy,
                null,
                this
            );
            
            this.body.setVelocityY(gamePrefs.ROCK_FALLIN_SPEED)

        
        }
    }
    squishEnemy(rock,enemy){
        rock.scene.squishEnemy(enemy);
    }
}