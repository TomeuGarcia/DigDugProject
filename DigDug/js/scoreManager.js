class scoreManager{
    
    constructor(){
        var score = 0;
        var scoreText;
    }

    init(){
        scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    }
    

    addScore (score)
    {
    score += score;
    scoreText.setText('Score: ' + score);
    }


}