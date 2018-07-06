'use strict';
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error(`Можно прибавлять к вектору только вектор типа Vector!`);
    } 
    return new Vector(this.x + vector.x, this.y + vector.y); 
  }

  times(multiplier) {
    return new Vector(this.x * multiplier, this.y * multiplier); 
  }
}

class Actor {
  constructor(position = new Vector(), size = new Vector(1, 1), speed = new Vector()) {
    if ((!(position instanceof Vector)) || (!(size instanceof Vector)) || (!(speed instanceof Vector)))  {
      throw new Error(`Аргумент Позиции, Размера или Скорости объекта типа Actor может быть передан только вектором типа Vector!`);
    }
    this.pos = position;
    this.size = size;
    this.speed = speed;
    this.act = function() {};	
    Object.defineProperties(this, {
      'left': {
        get() { return this.pos.x; }
      },
      'top': {
        get() { return this.pos.y; }
      },
      'right': {
        get() { return this.pos.x + this.size.x; }
      },
      'bottom': {
        get() { return this.pos.y + this.size.y; }
      }
    });
  }

  get type() {
    return 'actor';
  }

  isIntersect(actor) {
    if ((!(actor instanceof Actor)) || (actor === undefined))  {
      throw new Error(`Движущийся объект actor может быть передан только объектом типа Actor, и не равен undefined!`);
    } 
    return (this === actor) ? false : ((this.left < actor.right) && (this.right > actor.left) && (this.top < actor.bottom) && (this.bottom > actor.top)) ? true : false;
  }  
}


class Level {
  constructor(gameFieldGrid, listOfActor = []) {
    this.grid = gameFieldGrid;
    this.actors = listOfActor;
    this.player = listOfActor.find((actor) => (actor.type === 'player'));
    this.height = (gameFieldGrid) ? gameFieldGrid.length : 0; 
    this.width = (gameFieldGrid) ? Math.max(...(gameFieldGrid.map((line) => (line.length)))) : 0; 
    this.status = null;
    this.finishDelay = 1;
  }

  isFinished() {
    return ((this.status !== null) && (this.finishDelay < 0)) ? true : false;
  }

  actorAt(actor) {
    if ((!(Actor.prototype.isPrototypeOf(actor))) || (actor === undefined))  {
      throw new Error(`Движущийся объект actor может быть передан только объектом типа Actor, и не равен undefined!`);
    } 
    return this.actors.find((otherActor) => otherActor.isIntersect(actor));
  }

  obstacleAt(position, size) {
    if ((!(position instanceof Vector)) || (!(size instanceof Vector)))  {
      throw new Error(`Аргумент Позиции или Размера объекта типа Actor может быть передан только вектором типа Vector!`);
    }
    const actor = new Actor(position, size);
    if ( (actor.left < 0) || (actor.top < 0) || (actor.right > this.width) ) {
       return 'wall';
    } else if (actor.bottom > this.height) {
       return 'lava';
    } 
    for (let x = actor.left; x < actor.right; x++) {
      for (let y = actor.top; y < actor.bottom; y++) {
        if (this.grid[Math.floor(y)][Math.floor(x)]) {
          return this.grid[Math.floor(y)][Math.floor(x)];
        }
      }  
    }
  }
}

class Player extends Actor {
  constructor(position = new Vector()) {
    super(position);
    this.pos = position.plus(new Vector(0, -0.5));
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector();
  }
  
  get type() {
    return 'player';
  }
}