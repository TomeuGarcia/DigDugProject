class level1 extends level
{
    constructor()
    {
        super('level1');

        this.playerMoveAxisFunction = this.setPlayerMoveAxisWithAnimation;

        this.animMoveAxis = new Phaser.Math.Vector2(0, 0);
    }
   

    create()
    {
        super.create();
        
        this.startAnim();
    }


    createObjectOfClass(objectClass, pixPos)
    {
        super.createObjectOfClass(objectClass, pixPos);

        if (objectClass == loadPrefs.PLAYER_FIRST_SPAWN_ANIM_CLASS)
        {
            this.playerFirstSpawnPos = new Phaser.Math.Vector2(pixPos.x, pixPos.y);
        }
    }


    startAnim()
    {
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

        this.time.delayedCall(3750, this.finishAnimation, [], this);
    }


    finishAnimation()
    {
        this.animMoveAxis.x = 0;
        this.animMoveAxis.y = 0;

        this.player.flipX = true;
        this.player.rotation = 0;

        this.playerMoveAxisFunction = this.setPlayerMoveAxisWithInputs;
    }


    setPlayerMoveAxis() // override
    {
        this.playerMoveAxisFunction();
    }

    setPlayerMoveAxisWithAnimation()
    {
        this.player.setMoveAxis(this.animMoveAxis);
    }


}