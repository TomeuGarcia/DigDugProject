var fruits;
class fruitManager{
    
constructor(){
    fruits = this.physics.add.staticGroup()
    this.physics.add.overlap(player, fruits, CollectFruit, null, this);
}
SpawnFruit(){
    fruits.create(innerWidth, innerHeight, 'pooka');
}
CollectFruit(){
    fruit.disableBody(true, true);
    //call add score
}

}