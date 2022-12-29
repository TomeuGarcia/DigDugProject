
class loadingScene extends Phaser.Scene
{
    constructor(_sceneKey)
    {
        super({key: 'loadingScene'});
    }
    
    preload()
    {
		this.cameras.main.setBackgroundColor("#000");

        // ---- FONTS ----
        this.load.setPath('assets/fonts/');
        this.load.bitmapFont('gameFont', 'GameFont.png', 'GameFont.xml');

        this.load.setPath('assets/images/');

		this.load.image('namcoLogo', 'namcoLogo.png');
		this.load.image('digDugTitle', 'digDugTitle.png');
		this.load.image('pointer', 'mainMenuPointer.png');
        
        this.load.spritesheet('player', 'player.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('playerLives', 'playerLives.png', {frameWidth: 32, frameHeight: 16});
        this.load.image('maskDigBottom', 'diggedFromBottom.png');
        this.load.image('maskDigBottomRight', 'diggedCornerBottomRight.png');
        this.load.image('watermelon', 'watermelon.png');
        this.load.image('harpoonH', 'harpoonHorizontal.png');
        this.load.image('harpoonV', 'harpoonVertical.png');
        this.load.image('maskHarpoonH', 'harpoonHorizontalMask.png');
        this.load.image('maskHarpoonV', 'harpoonVerticalMask.png');

        // Pooka enemy
        this.load.spritesheet('pooka', 'pookaNormal.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('pookaInflate', 'pookaInflate.png', {frameWidth: 24, frameHeight: 24});
        // Fygar enemy
        this.load.spritesheet('fygar', 'fygarNormal2.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('fygarInflate', 'fygarInflate.png', {frameWidth: 24, frameHeight: 24});
        this.load.spritesheet('fygarFire', 'fygarFire.png', {frameWidth: 48, frameHeight: 16});
        this.load.image('fireSmall', 'fireSmall.png');
        this.load.image('fireMedium', 'fireMedium.png');
        this.load.image('fireBig', 'fireBig.png');
        
        this.load.image('brush','diggedBottom.png');

        // Fruits
        this.load.spritesheet('fruits', 'fruits.png', {frameWidth: 16, frameHeight: 16});

        // Flowers
        this.load.spritesheet('flowers', 'flowers.png', {frameWidth: 16, frameHeight: 24});

        // Rock
        this.load.spritesheet('rock','rock.png', {frameWidth:16,frameHeight:16});

        // Points
        this.load.image('pointsHolder', 'pointsHolder.png', {frameWidth:28,frameHeight:13});

        // Tilemap
        this.load.image('digDugTileset','digDugTilesetPalette.png'); // MUST HAVE SAME TAG AS IN TILED

        // Audios
        this.load.setPath('assets/audios/');
        this.load.audio('stageClear', 'StageClear.mp3');
        this.load.audio('gameOver', 'GameOver.mp3');
        this.load.audio('startMusic', 'StartMusic.mp3');
        this.load.audio('lastOneSound', 'LastOneSound.mp3');
        this.load.audio('lastOneMusic', 'LastOneMusic.mp3');
        this.load.audio('bonusSound', 'BonusSound.mp3');
        // menu
        this.load.audio('nameEntry', 'NameEntry.mp3');
        this.load.audio('credit', 'Credit.mp3');
        // enemies
        this.load.audio('fygarFire', 'FygarFlame.mp3');
        this.load.audio('enemyBlowUp', 'MonsterBlow.mp3');
        this.load.audio('enemyMoving', 'MonsterMoving.mp3');
        this.load.audio('enemySquashed', 'MonsterSquashed.mp3');
        // player
        this.load.audio('playerHarpoon', 'PlayerHarpoon.mp3');
        this.load.audio('playerMiss', 'PlayerMiss.mp3');
        this.load.audio('playerPumping', 'PlayerPumping.mp3');
        this.load.audio('playerDisappearing', 'PlayerDisappearing.mp3');
        this.load.audio('playerTouched', 'PlayerTouched.mp3');
        this.load.audio('playerWalking', 'PlayerWalking.mp3');//'LaXalana_1.mp3');
        // rock
        this.load.audio('rockBroken', 'RockBroken.mp3');
        this.load.audio('rockDropping', 'RockDropping.mp3');
        this.load.audio('rockHit', 'RockHit.mp3');
        
        this.load.on('progress', function(value) 
        {
            
        }, this);
    }

    create()
    {
        this.loadAnimations();
        //this.loadAudios();

        this.time.delayedCall(100, this.changeScene, [], this);
    }
    
    loadAnimations()
    {
        this.anims.create
        ({
            key: 'playerRun',
            frames: this.anims.generateFrameNumbers('player', {start: 0, end: 1}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create
        ({
            key: 'playerRunDigging',
            frames: this.anims.generateFrameNumbers('player', {start: 2, end: 3}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create // Only plays when the player presses (if not it stays on frame 4)
        ({
            key: 'playerPumping',
            frames: this.anims.generateFrameNumbers('player', {start: 4, end: 5}),
            frameRate: 10,
            repeat: 0
        })

        this.anims.create
        ({
            key: 'playerDying',
            frames: this.anims.generateFrameNumbers('player', {start: 8, end: 13}),
            frameRate: 2,
            repeat: 0
        })

        // POOKA
        this.anims.create
        ({
            key: 'pookaWalking',
            frames: this.anims.generateFrameNumbers('pooka', {start: 0, end: 1}),
            frameRate: 2,
            repeat: -1
        });

        this.anims.create
        ({
            key: 'pookaGhosting',
            frames: this.anims.generateFrameNumbers('pooka', {start: 2, end: 3}),
            frameRate: 2,
            repeat: -1
        });

     
        // FYGAR
        this.anims.create
        ({
            key: 'fygarWalking',
            frames: this.anims.generateFrameNumbers('fygar', {start: 1, end: 2}),
            frameRate: 2,
            repeat: -1
        });

        this.anims.create
        ({
            key: 'fygarGhosting',
            frames: this.anims.generateFrameNumbers('fygar', {start: 4, end: 5}),
            frameRate: 2,
            repeat: -1
        });

        this.anims.create
        ({
            key: 'fygarAttacking',
            frames: this.anims.generateFrameNumbers('fygar', {start: 0, end: 1}),
            frameRate: 2,
            repeat: -1
        });

        this.anims.create
        ({
            key: 'fygarFireAttack',
            frames: this.anims.generateFrameNumbers('fygarFire', {start: 0, end: 2}),
            frameRate: 2,
            repeat: 0
        });

        //ROCK
        this.anims.create
        ({
            key: 'rockStartFalling',
            frames: this.anims.generateFrameNumbers('rock', {start: 0, end: 1}),
            frameRate: 2,
            repeat: 1
        });

        this.anims.create
        ({
            key: 'rockDestroy',
            frames:this.anims.generateFrameNumbers('rock',{start:2,end:3}),
            frameRate:2,
            repeat:0

        });
    }

    changeScene()
    {
        this.scene.start('menu');
    }
}