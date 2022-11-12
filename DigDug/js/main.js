


var gamePrefs =
{
    PLAYER_MOVE_SPEED: 1, // can only be: 0.5, 1, 2, 4...
    CELL_SIZE: 16,
    HALF_CELL_SIZE: 8,
    NUM_CELL_WIDTH: 14,
    NUM_CELL_HEIGHT: 15,
    NUM_CELL_LEFT_OFFSET: 1,
    NUM_CELL_TOP_OFFSET: 2,
    NUM_CELL_TOP_AIR: 1
}

var config = 
{
    type: Phaser.AUTO,
    width: 256, // window.innerWidth  //menu --> width: 480,
    height: 288, //256,  // window.innerHeight //menu --> height: 360,
    scene:[menu, level1, gameState], // levels/screens/scenes array
    render:
    {
        pixelArt: true
    },
    scale: 
    {
        mode:Phaser.Scale.FIT,
        autoCenter:Phaser.Scale.CENTER_BOTH
    },
    physics:
    {
        default:'arcade',
        arcade:
        {
            gravity:{y:0},
            //debug:true 
        }
    }

}


var game = new Phaser.Game(config);