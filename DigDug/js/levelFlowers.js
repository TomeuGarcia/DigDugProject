

class levelFlowers
{
    constructor(_scene, _positionX, _positionY, _spriteTag, _levelNumber)
    {       
        const numBigRedFlowers = Phaser.Math.FloorTo(_levelNumber / gamePrefs.BIG_RED_FLOWER_LVL_COUNT);
        if (numBigRedFlowers > 0)
        {
            _levelNumber -= gamePrefs.BIG_RED_FLOWER_LVL_COUNT * numBigRedFlowers;
        }

        const numBigFlowers = Phaser.Math.FloorTo(_levelNumber / gamePrefs.BIG_FLOWER_LVL_COUNT);
        const numSmallFlowers = _levelNumber % gamePrefs.BIG_FLOWER_LVL_COUNT;

        
        var flowerCount = 0;
        for (var i = 0; i < numBigRedFlowers; ++i, ++flowerCount)
        {
            _scene.add.sprite(_positionX - (gamePrefs.CELL_SIZE * flowerCount), _positionY, _spriteTag, 2).setOrigin(1, 1);
        }

        for (var i = 0; i < numBigFlowers; ++i, ++flowerCount)
        {
            _scene.add.sprite(_positionX - (gamePrefs.CELL_SIZE * flowerCount), _positionY, _spriteTag, 1).setOrigin(1, 1);
        }

        for (var i = 0; i < numSmallFlowers; ++i, ++flowerCount)
        {
            _scene.add.sprite(_positionX - (gamePrefs.CELL_SIZE * flowerCount), _positionY, _spriteTag, 0).setOrigin(1, 1);
        }

    }



}