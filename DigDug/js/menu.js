class menu extends Phaser.Scene{
	constructor()
	{
        super({key: 'menu'});
	}

	preload()
	{
		this.load.setPath('assets/images/');
        this.load.image('menu', 'mainMenu_Clean.png');
		this.load.image('pointer', 'mainMenuPointer.png');
	}

	create()
	{
        this.cursors = this.input.keyboard.createCursorKeys();
		this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

		this.bgBack = this.add.sprite(-40, 10, 'menu').setOrigin(0).setScale(.7);
		this.pointer = this.add.sprite(config.width/2 - 45, config.height/2 + 5, 'pointer').setOrigin(.5).setScale(.7);

		// Player 1 score
		this.firstPlayerScore = this.add.text(
			config.width/2 - 60, 
			40, 
			"00", 
			{
				fontFamily: 'Arial Black',
				fill: '#FFFFFF',
				stroke: '#FFFFFF'
			}
		).setOrigin(0).setScale(.7);

		// High-score
		this.highScore = this.add.text(
			config.width/2, 
			40, 
			"10000", 
			{
				fontFamily: 'Arial Black',
				fill: '#FFFFFF',
				stroke: '#FFFFFF'
			}
		).setOrigin(0).setScale(.7);

		// Player 2 score
		this.secondPlayerScore = this.add.text(
			config.width/2 + 100, 
			40, 
			"00", 
			{
				fontFamily: 'Arial Black',
				fill: '#FFFFFF',
				stroke: '#FFFFFF'
			}
		).setOrigin(0).setScale(.7);

		// == BUTTONS ==
		// 1 player button
		this.button = this.add.text(
			config.width/2 - 30,
			config.height/2,
			"1 PLAYER",
			{
				fontFamily:  'Arial Black',
				fill: '#FFFFFF',
				stroke: '#FFFFFF'
			}
		)
		.setOrigin(0)
		.setScale(.7)
		.setInteractive({useHandCursor: true})
		.on(
			'pointerdown',
			this.startGame,
			this
		);

		// 2 player button
		this.button = this.add.text(
			config.width/2 - 30,
			config.height/2 + 30,
			"2 PLAYERS",
			{
				fontFamily:  'Arial Black',
				fill: '#FFFFFF',
				stroke: '#FFFFFF'
			}
		)
		.setOrigin(0)
		.setScale(.7)
		.setInteractive({useHandCursor: true})
		.on(
			'pointerdown',
			this.startGame,
			this
		);
	}

	startGame()
	{
		console.log("START GAME");
		this.changeScene();
	}

	changeScene()
	{
		this.scene.start('gameState');
	}

	update()
	{
        if (this.cursors.down.isDown) 
		{
			this.pointer.setY(config.height/2 + 35);
		}
		else if (this.cursors.up.isDown)
		{
			this.pointer.setY(config.height/2 + 5);
		}
		else if (this.enterKey.isDown || this.cursors.space.isDown)
		{
			this.startGame();
		}
	}
}