class level1 extends level
{
    constructor()
    {
        super('level1');
    }
   

    backToMenu() // override for testing purposes
    {
        console.log("back to menu from level1");
        super.backToMenu();
    }

}