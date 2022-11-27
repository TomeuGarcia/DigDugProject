var fruits;
class fruitManager{
    
constructor(){
    fruits = Phaser.Game.physics.add.staticGroup()
    Phaser.Game.physics.add.overlap(player, fruits, CollectFruit, null, this);
}
SpawnFruit(){
    fruits.create(innerWidth, innerHeight, 'fruit');
}
CollectFruit(){
    fruit.disableBody(true, true);
    //call add score
}

}