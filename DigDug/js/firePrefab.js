
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
        this.body.setSize(16, 16);
        this.visible = false;

        //this.anims.play('fygarFireAttack', true);

        this.scene = _scene;
        this.owner = _owner;
        this.ownerEndAttackCallback = _ownerEndAttackCallback;
        this.isAttacking = false;
        this.isInterupted = false;
        this.initPosX = _positionX;
        this.initPosY = _positionY;
        
        this.fireSequence = [];
        this.fireSequence.push('fireSmall');
        this.fireSequence.push('fireMedium');
        this.fireSequence.push('fireBig');
        this.fireSizes = [];
        this.fireSizes.push(16 -8);
        this.fireSizes.push(32 -8);
        this.fireSizes.push(48 -8);
        this.fireSequenceIndex = 0;

        this.setTexture(this.fireSequence[this.fireSequenceIndex]);

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

    }

    preUpdate(time, delta)
    {
        super.preUpdate(time, delta);
    }

    initFireCollisionsWithPlayer()
    {
        this.playerFireOverlap = this.scene.physics.add.overlap(
            this, 
            this.scene.player,
            this.hit,
            null,
            this
        );
    }

    hit(_fire, _player)
    {
        if (_player.isHit) return;

        // Kill player
        _player.die();
    }

    hitTerrain()
    {
        if (!this.isAttacking) { return; }

        var cell;
        if (this.flipX)
            cell = new Phaser.Math.Vector2(this.scene.pix2cell(this.x - this.fireSizes[this.fireSequenceIndex - 1], this.y));
        else
            cell = new Phaser.Math.Vector2(this.scene.pix2cell(this.x + this.fireSizes[this.fireSequenceIndex - 1], this.y));
         
        if (!this.scene.isEmptyCell(cell.x, cell.y) || this.body.blocked.right || this.body.blocked.left)
        {
            this.stopFire();
        }
    }

    startAttack(_posX, _posY, _flip)
    {
        if (this.isAttacking) return;
    
        if (_flip)
        {
            this.setOrigin(1, 0.5);
            this.body.setSize(this.fireSizes[this.fireSequenceIndex], 10);
            _posX -= gamePrefs.HALF_CELL_SIZE;
        }
        else
        {
            this.setOrigin(0, .5);
            this.body.setSize(this.fireSizes[this.fireSequenceIndex], 10);
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
        this.visible = true;
        this.setActive(true);
        //this.anims.play('fygarFireAttack', true);

        this.incrementFire();
    }

    incrementFire()
    {
        if (this.isInterupted) { return; }

        if (this.fireSequenceIndex >= this.fireSequence.length) 
        { 
            this.stopFire(); 
        }
        else 
        { 
            this.setTexture(this.fireSequence[this.fireSequenceIndex]); 
            this.body.setSize(this.fireSizes[this.fireSequenceIndex], 10);
            this.scene.time.delayedCall(gamePrefs.FIRE_PROGRESS_TIME_MILLISECONDS, this.incrementFire, [], this);

            ++this.fireSequenceIndex;
            
            if (this.isAttacking)
                this.scene.fygarFire.play();
        }
    }

    stopFire()
    {
        this.scene.fygarFire.stop();
        this.resetSelfValues();
        this.resetOwnerPatrol(); 
    }

    resetOwnerPatrol()
    {
        if (this.owner != null)
        {
            this.ownerEndAttackCallback(this.owner);
        }        
    }

    resetSelfValues()
    {
        if (this.incrementFireTimer != undefined)
            this.incrementFireTimer.remove(false);

        this.x = this.initPosX;
        this.y = this.initPosY;
        this.isAttacking = false;
        this.fireSequenceIndex = 0;
        this.visible = false;
        this.setActive(false);

        this.setTexture(this.fireSequence[this.fireSequenceIndex]); 
        this.body.setSize(this.fireSizes[this.fireSequenceIndex], 16);
    }
}