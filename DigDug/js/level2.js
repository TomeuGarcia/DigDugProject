class level2 extends level
{
    constructor()
    {
        super('level2');
    }
   

    backToMenu() // override for testing purposes
    {
        console.log("back to menu from level2");
        super.backToMenu();
    }

}