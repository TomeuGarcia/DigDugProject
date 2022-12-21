class menu extends Phaser.Scene
{
	constructor()
	{
        super({key: 'menu'});
	}

	preload()
	{
	}

	create()
	{
        this.cursors = this.input.keyboard.createCursorKeys();
		this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

		this.pointer = this.add.sprite(config.width/2 - 45, config.height/2 + 3, 'pointer').setOrigin(0.5).setScale(.7);

		// Player 1 score
		this.firstPlayerScoreText = this.add.bitmapText(50, 30, 'gameFont', '1UP', 10)
												.setTint(uiPrefs.TEXT_COLOR_RED).setOrigin(0.5, 0);

		// RESET SCORES
		//localStorage.setItem(storagePrefs.HIGHEST_SCORE, 1000);
		//localStorage.setItem(storagePrefs.PLAYER_1_SCORE, 0);

		const player1Score = localStorage.getItem(storagePrefs.PLAYER_1_SCORE);
		const firstPlayerScoreCount = player1Score != null ? player1Score : 0;
		this.firstPlayerScore = this.add.bitmapText(50, 45, 'gameFont', parseInt(firstPlayerScoreCount), 10)
											.setTint(uiPrefs.TEXT_COLOR_WHITE).setOrigin(0.5, 0);

		// High-score
		this.highScoreText = this.add.bitmapText(config.width/2, 30, 'gameFont', 'HIGH-SCORE', 10)
										.setTint(uiPrefs.TEXT_COLOR_RED).setOrigin(0.5, 0);

		const highestScore = localStorage.getItem(storagePrefs.HIGHEST_SCORE);	
		var highestScoreCount = highestScore != null ? highestScore : 0;
/*
		if (firstPlayerScoreCount > highestScoreCount) 
		{
			highestScoreCount = firstPlayerScoreCount
			localStorage.setItem(storagePrefs.HIGHEST_SCORE, highestScoreCount);
		}
*/
		this.firstPlayerScore = this.add.bitmapText(config.width/2, 45, 'gameFont', parseInt(highestScoreCount), 10)
											.setTint(uiPrefs.TEXT_COLOR_WHITE).setOrigin(0.5, 0);


		// Player 2 score
		this.secondPlayerScoreText = this.add.bitmapText(config.width -50, 30, 'gameFont', '2UP', 10)
												.setTint(uiPrefs.TEXT_COLOR_RED).setOrigin(0.5, 0);

		const secondPlayerScoreCount = 0;
		this.secondPlayerScore = this.add.bitmapText(config.width - 50, 45, 'gameFont', parseInt(secondPlayerScoreCount), 10)
											.setTint(uiPrefs.TEXT_COLOR_WHITE).setOrigin(0.5, 0);

		// Dig Dug Title
		this.add.sprite(config.width/2, config.height/2 - 50, 'digDugTitle').setOrigin(0.5).setScale(.7);


		// Dates & all rights reserved
		this.dates = this.add.bitmapText(config.width/2, config.height - 45, 'gameFont', '1982 1985 NAMCO LTD.\n\nALL RIGHTS RESERVED', 8)
								.setTint(uiPrefs.TEXT_COLOR_WHITE).setOrigin(0.5);


		// == BUTTONS ==
		// 1 player button
		this.player1Button = this.add.bitmapText(config.width/2, config.height/2, 'gameFont', '1 PLAYER', 8)
										.setTint(uiPrefs.TEXT_COLOR_WHITE).setOrigin(0.5, 0)
										.setInteractive({useHandCursor: true})
										.on(
											'pointerdown',
											this.startGame,
											this
										);

		// 2 player button
		this.player2Button = this.add.bitmapText(config.width/2, config.height/2 + 20, 'gameFont', '2 PLAYER', 8)
										.setTint(uiPrefs.TEXT_COLOR_WHITE).setOrigin(0.5, 0)
										.setInteractive({useHandCursor: true})
										.on(
											'pointerdown',
											this.startGame,
											this
										);

		this.add.sprite(config.width/2, config.height - 85, 'namcoLogo').setOrigin(0.5).setScale(.06);


	}

	startGame()
	{
		this.changeScene();
	}

	changeScene()
	{
		const levelNumber = 3;

		this.scene.start('level'+levelNumber, {levelNumber: levelNumber});
	}

	update()
	{
        if (this.cursors.down.isDown) 
		{
			this.pointer.setY(config.height/2 + 23);
		}
		else if (this.cursors.up.isDown)
		{
			this.pointer.setY(config.height/2 + 3);
		}
		else if (this.enterKey.isDown || this.cursors.space.isDown)
		{
			this.startGame();
		}
	}
}