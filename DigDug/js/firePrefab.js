
class firePrefab extends Phaser.GameObjects.Sprite
{
    constructor(_scene, _positionX, _positionY, _owner, _ownerEndAttackCallback)
    {
        super(_scene, _positionX, _positionY);

        this.depth = 3;

        _scene.add.existing(this);
        _scene.physics.world.enable(this);
        this.body.collideWorldBounds = true;
        this.body.allowGravity = false;
        this.body.setSize(48, 16);

        this.anims.play('fygarFireAttack', true);

        this.scene = _scene;
        this.owner = _owner;
        this.ownerEndAttackCallback = _ownerEndAttackCallback;
        this.isAttacking = false;
        this.initPosX = _positionX;
        this.initPosY = _positionY;
        
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
        
        this.borderOverlap = _scene.physics.add.overlap(
            this,
            _scene.borders,
            this.hitTerrain,
            null,
            this
        );

        this.groundOverlap = _scene.physics.add.overlap(
            this,
            _scene.digGround,
            this.hitTerrain,
            null,
            this
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

    hitTerrain()
    {
        /*var cell = new Phaser.Math.Vector2(this.scene.pix2cell(this.x, this.y));
         
        if (this.isAttacking && !this.scene.isEmptyCell(cell.x, cell.y))
        {
            this.resetOwnerPatrol();
        }*/
    }

    startAttack(_posX, _posY, _flip)
    {
        if (_flip)
        {
            this.setOrigin(1, 0.5);
            this.body.setSize(48, 16);
            _posX -= gamePrefs.HALF_CELL_SIZE;
        }
        else
        {
            this.setOrigin(0, .5);
            this.body.setSize(48, 16);
            _posX += gamePrefs.HALF_CELL_SIZE;
        }
        this.flipX = _flip;

        this.visible = true;
        this.setActive(true);

        this.x = _posX;
        this.y = _posY;

        this.startFireAnim();
    }

    startFireAnim()
    {
        this.isAttacking = true;
        this.anims.play('fygarFireAttack', true);

        this.incrementFireTimer = this.scene.time.addEvent({
            delay: 200,
            callback: this.incrementFire,
            callbackScope: this,
            repeat: -1
        });
    }

    incrementFire()
    {
        ++this.fireSequenceIndex;

        //if (this.fireSequenceIndex >= this.fireSequence.length) { this.resetOwnerPatrol(); }
    }

    resetOwnerPatrol()
    {
        if (this.isAttacking)
        {
            console.log("resetOwnerPatrol()");
    
            if (this.incrementFireTimer != undefined)
                this.incrementFireTimer.remove(false);
    
            this.x = this.initPosX;
            this.y = this.initPosY;
            this.isAttacking = false;
            this.fireSequenceIndex = 0;
            this.visible = false;
            this.setActive(false);
            this.ownerEndAttackCallback(this.owner);
        }
    }
}