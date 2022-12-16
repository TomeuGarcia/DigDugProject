


var gamePrefs =
{
    PLAYER_MOVE_SPEED: 36,
    ROCK_FALLIN_SPEED: 50,
    ROCK_HIT_WIDTH: 14,
    CELL_SIZE: 16,
    HALF_CELL_SIZE: 8,
    NUM_CELL_WIDTH: 20,
    NUM_CELL_HEIGHT: 18,
    NUM_CELL_LEFT_OFFSET: 1,
    NUM_CELL_TOP_OFFSET: 2,
    NUM_CELL_TOP_AIR: 1, 
    ENEMY_MIN_SPEED: 20,
    ENEMY_MAX_SPEED: 40,
    FIRE_PROGRESS_TIME_MILLISECONDS: 800,
    ENEMY_SPEED_INC_SPAN_SECONDS: 30,
    HARPOON_SPEED: 90,
    HARPOON_LIFETIME: 50,
    PLAYER_HIT_DIST: 12,
    NUM_FRUITS: 11,
    FRUIT_SPAWN_MIN_DELAY: 10000,
    FRUIT_SPAWN_MAX_DELAY: 20000,
    BIG_RED_FLOWER_LVL_COUNT: 30,
    BIG_FLOWER_LVL_COUNT: 10,
    LAST_LEVEL_NUMBER: 2,
    TIME_UNTIL_NEXT_SCENE: 3000
}

var uiPrefs =
{
    TEXT_COLOR_RED: 0xff3f2f,
    TEXT_COLOR_WHITE: 0xffffff,
    TEXT_COLOR_BLUE: 0x28ffff
}

var storagePrefs =
{
    PLAYER_1_SCORE: 'player1Score',
    HIGHEST_SCORE: 'highestScore'
}

var loadPrefs =
{
    ROCK_CLASS: 'rock',
    POOKA_CLASS: 'pooka',
    FYGAR_CLASS: 'fygar',
    PLAYER_FIRST_SPAWN_ANIM_CLASS: 'playerFirstSpawnAnim',
    PLAYER_RESPAWN_CLASS: 'playerRespawn',
    FRUIT_RESPAWN_CLASS: 'fruitRespawn'
}

var config = 
{
    type: Phaser.AUTO,
    width: gamePrefs.CELL_SIZE * 20, // window.innerWidth
    height: gamePrefs.CELL_SIZE * 18, //256,  // window.innerHeight
    scene:[menu, level1, level2], // levels/screens/scenes array
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
            debug:false 
        }
    }

}

const MapContent = {
    Empty: 0,
    Ground: 1
}


var game = new Phaser.Game(config);