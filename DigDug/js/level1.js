class level1 extends level
{
    constructor()
    {
        super('level1');
    }
   

    create()
    {
        this.animMoveAxis = new Phaser.Math.Vector2(0, 0);
        this.playerMoveAxisFunction = this.setPlayerAnimationInputs;

        this.playerWalkingHolder;

        super.create();
                
    }

    loadAudios()
    {
        super.loadAudios();
        this.startMusic = this.sound.add('startMusic', {volume: audioPrefs.VOLUME});
    }

    createObjectOfClass(objectClass, pixPos)
    {
        super.createObjectOfClass(objectClass, pixPos);

        if (objectClass == loadPrefs.PLAYER_FIRST_SPAWN_ANIM_CLASS)
        {
            this.playerFirstSpawnPos = new Phaser.Math.Vector2(pixPos.x, pixPos.y);
        }
    }

    startAnim() // override
    {
        this.pauseEnemies();
        
        this.playerWalkingHolder = this.playerWalking;
        this.playerWalking = this.startMusic;
        this.playerWalking.play();
        this.playerWalking.pause();

        this.player.x = this.playerFirstSpawnPos.x;
        this.player.y = this.playerFirstSpawnPos.y;
        this.player.flipX = true;

        this.time.delayedCall(400, this.animMoveLeft, [], this);
    }

    animMoveLeft()
    {
        this.animMoveAxis.x = -1;
        this.animMoveAxis.y = 0;

        this.time.delayedCall(2000, this.animMoveDown, [], this);
    }

    animMoveDown()
    {
        this.animMoveAxis.x = 0;
        this.animMoveAxis.y = 1;

        this.time.delayedCall(3750, this.animStopMove, [], this);
    }

    animStopMove()
    {
        this.animMoveAxis.x = 0;
        this.animMoveAxis.y = 0;

        this.player.flipX = true;
        this.player.rotation = 0;
        this.player.playerMovement = PlayerMovement.LEFT

        this.time.delayedCall(500, this.finishAnimation, [], this);
    }
 
    finishAnimation() // override
    {
        this.playerWalking = this.playerWalkingHolder;
        this.playerWalking.play();
        this.playerWalking.pause();

        this.playerMoveAxisFunction = this.setPlayerMoveAndHarpoonInputs;
        this.resumeEnemies();
    }


    setPlayerInputs() // override
    {
        this.playerMoveAxisFunction();
    }

    setPlayerAnimationInputs() // override
    {
        this.player.setMoveAxis(this.animMoveAxis);
    }


}