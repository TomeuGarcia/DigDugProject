
class pointsText
{
    constructor(_scene, _positionX, _positionY, _spriteTag)
    {
        this.scene = _scene;

        this.isActive = true;

        this.holderSprite = _scene.add.sprite(_positionX, _positionY, _spriteTag);
        this.holderSprite.setOrigin(0.5, 0.5);
        this.holderSprite.depth = 10;

        this.text = _scene.add.bitmapText(_positionX, _positionY+1, 'gameFont', '0000', 7)
                        .setTint(uiPrefs.TEXT_COLOR_BLUE).setOrigin(0.5, 0.5);
        this.text.depth = 10;
    }


    setScoreText(_score)
    {
        this.text.text = parseInt(_score);
        this.text.setCenterAlign();
    }

    startHide()
    {
        this.scene.time.delayedCall(2500, this.hide, [], this);
    }

    show()
    {
        this.holderSprite.setActive(true);
        this.holderSprite.visible = true;

        this.text.setActive(true);
        this.text.visible = true;

        this.isActive = true;
    }

    hide()
    {
        this.holderSprite.setActive(false);
        this.holderSprite.visible = false;

        this.text.setActive(false);
        this.text.visible = false;

        this.isActive = false;
    }

    resetPosition(_positionX, _positionY)
    {
        this.holderSprite.x = _positionX;
        this.holderSprite.y = _positionY;

        this.text.x = _positionX;
        this.text.y = _positionY+1;
    }

}