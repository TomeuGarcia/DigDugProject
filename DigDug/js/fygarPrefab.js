
class fygarPrefab extends enemyBase 
{
    constructor(_scene, _positionX, _positionY)
    {
        super(_scene, _positionX, _positionY, 'fygar', 'fygarInflate', 'fygarWalking', 'fygarGhosting');


    }

    preUpdate(time,delta)
    {
        super.preUpdate(time, delta);
    }

    doPatrol()
    {
        super();

    }

    doAttack()
    {
        
    }
}