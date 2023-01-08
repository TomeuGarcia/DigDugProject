class credits extends Phaser.Scene
{
	constructor()
	{
        super({key: 'credits'});
	}

	init()
	{
		
	}

	preload()
	{
	}

	create()
	{
		this.thanksForPlaying = this.add.bitmapText(config.width/2, 30, 'gameFont', ' Thanks for Playing', 10)
											.setTint(uiPrefs.TEXT_COLOR_WHITE).setOrigin(0.5, 0);

		
		this.names = this.add.bitmapText(config.width/2, 90, 'gameFont', 'Tomeu Garcia', 10)
											.setTint(uiPrefs.TEXT_COLOR_WHITE).setOrigin(0.5, 0);

		this.name1 = this.add.bitmapText(config.width/2, 110, 'gameFont', 'Roger Aguilar', 10)
											.setTint(uiPrefs.TEXT_COLOR_WHITE).setOrigin(0.5, 0);
		
		this.name2 = this.add.bitmapText(config.width/2, 130, 'gameFont', 'Aniol Barnada', 10)
											.setTint(uiPrefs.TEXT_COLOR_WHITE).setOrigin(0.5, 0);
		
		this.name3 = this.add.bitmapText(config.width/2, 200, 'gameFont', 'Original game by Namco', 10)
											.setTint(uiPrefs.TEXT_COLOR_RED).setOrigin(0.5, 0);

		


		this.time.delayedCall(5000, this.changeScene, [], this);
		

	}

	startGame()
	{
		
	}
	changeScene()
	{
		const playerLivesCount = 2;
		const playerScoreCount = 0;

		this.scene.start('menu', 
						{ levelNumber: 0, 
						  playerLivesCount: playerLivesCount, 
						  playerScoreCount : playerScoreCount,
						  digMode: this.digMode }
					);
	}

	update()
	{
		
	}
}