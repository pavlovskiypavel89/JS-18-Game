'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error(`One can add to the vector only a vector with class: Vector!`);
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
      throw new Error(`Arguments of 'position', 'size' or 'speed' of Actor class, can be set only by a vector with class: Vector!`);
    }
    this.pos = position;
    this.size = size;
    this.speed = speed;
  }

  get left() {
    return this.pos.x;
  }
  
  get top() {
    return this.pos.y;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get bottom() {
    return this.pos.y + this.size.y;
  }
  
  get type() {
    return 'actor';
  }

  isIntersect(actor) {
    if ((!(actor instanceof Actor)) || (actor === undefined))  {
      throw new Error(`Argument of 'actor' can be set only by a object with class: Actor, and isn't equal to 'undefined'!`);
    } 
    return (this === actor) ? false : ((this.left < actor.right) && (this.right > actor.left) && (this.top < actor.bottom) && (this.bottom > actor.top)) ? true : false;
  }

  act() {}  
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
    if ((!(actor instanceof Actor)) || (actor === undefined))  {
      throw new Error(`Argument of 'actor' can be set only by a object with class: Actor, and isn't equal to 'undefined'!`);
    } 
    return this.actors.find((otherActor) => otherActor.isIntersect(actor));
  }

  obstacleAt(position, size) {
    if ((!(position instanceof Vector)) || (!(size instanceof Vector)))  {
      throw new Error(`Arguments of 'position' or 'size' of Actor class, can be set only by a vector with type of: Vector!`);
    }
    const actor = new Actor(position, size);
    if ((actor.left < 0) || (actor.top < 0) || (actor.right > this.width)) {
       return 'wall';
    } else if (actor.bottom > this.height) {
       return 'lava';
    }
    for (let x = Math.floor(actor.left); x < actor.right; x++) {
      for (let y = Math.floor(actor.top); y < actor.bottom; y++) {
        const obstacle = this.grid[y][x];
        if (obstacle) {
          return obstacle;
        }
      }  
    }
  }

  removeActor(actor) {
    this.actors.splice(this.actors.findIndex((obj) => (obj === actor)), 1);
  }

   noMoreActors(typeOfActor) {
    return (!(this.actors.find((actor) => (actor.type === typeOfActor)))) ? true : false;
  }

   playerTouched(typeOfObject, actor) {
    if (this.status === null) {
      if ((typeOfObject === 'lava') || (typeOfObject === 'fireball')) {
        this.status = 'lost';
      } else if (typeOfObject === 'coin') {
        this.removeActor(actor);
        this.noMoreActors(typeOfObject) ? this.status = 'won' : '';
      }
    }
  }

}

class LevelParser {
  constructor(dict) {
    this.dict = dict;
  }

  actorFromSymbol(dictSymbol) {
    if (dictSymbol) {
      return this.dict[dictSymbol];
    }
  }

  obstacleFromSymbol(dictSymbol) {
    if (dictSymbol === 'x') {
      return 'wall';
    } else if (dictSymbol === '!') {
      return 'lava';
    } 
  }

  createGrid(lvlScheme) {
    return lvlScheme.map((schemeLine) => {
      const grid = [];
      schemeLine.split('').forEach((charOfObstacle) => {
       const obstacle = this.obstacleFromSymbol(charOfObstacle);
        return grid.push(obstacle);
       });
      return grid;
    });
 }

  createActors(lvlScheme) {
    return lvlScheme.reduce((listOfActors, schemeLine, schemeLineNumber) => {
      schemeLine.split('').forEach((charOfActor, schemeCellNumber) => {
        if ((this.dict) && (this.actorFromSymbol(charOfActor))) {
          const ConstructorOfActor = this.actorFromSymbol(charOfActor);
          if ((ConstructorOfActor === Actor) || (Actor.prototype.isPrototypeOf(ConstructorOfActor.prototype))) {
            listOfActors.push(new ConstructorOfActor(new Vector(schemeCellNumber, schemeLineNumber)));
          }
        }
      });
    return listOfActors;
    }, []);
  }
   
  parse(lvlScheme) {
    return new Level(this.createGrid(lvlScheme), this.createActors(lvlScheme));
  }	
}

class Fireball extends Actor {
  constructor(position = new Vector(), speed = new Vector()) {
    super(position, new Vector(1, 1), speed);
  }

  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    const distToNextPosition = this.speed.times(time);
    return new Vector(this.left, this.top).plus(distToNextPosition);
  }
   
  handleObstacle() {
    this.speed = this.speed.times(-1);
  }

  act(time, lvl) {
    const nextPosition = this.getNextPosition(time);
    if (lvl.obstacleAt(nextPosition, this.size)) {
      this.handleObstacle();
    } else {
      this.pos = nextPosition;
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(position = new Vector()) {
    super(position, new Vector(2, 0));    
  }
}

class VerticalFireball extends Fireball {
  constructor(position = new Vector()) {
    super(position, new Vector(0, 2)); 
  }
}

class FireRain extends Fireball {
  constructor(position = new Vector()) {
    super(position, new Vector(0, 3));
    this.start = position;
  }

  get startPos() {
    return this.start;
  }
  
  handleObstacle() {
    this.pos = this.startPos;
    this.speed = this.speed;
  }
}

class Coin extends Actor {
  constructor(position = new Vector()) {
    super(position = position.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6), new Vector());
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * 2 * Math.PI;
    this.start = position; 
  }

  get type() {
    return 'coin';
  }

  get startPos() {
    return this.start;
  }

  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    const springVector = this.getSpringVector();
    return this.startPos.plus(springVector);
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  constructor(position = new Vector()) {
    super(position = position.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5), new Vector());
  }

  get type() {
    return 'player';
  }
}



// Add a Dictionary, and fill it with Actors:
const actorDict = {
  '@': Player, // Object
  'o': Coin, // Object
  '=': HorizontalFireball, // Object
  '|': VerticalFireball, // Object
  'v': FireRain // Object
}

// Add a LevelPareser for the created schemas:
const parser = new LevelParser(actorDict);

// Load the created levels schemas (Promise will be resolved by JSON-string, in which encoded an array of created levels schemas);
// Parse the resolved JSON-string (Function will be return the array of strings - list of created levels schemas);
// Run  the game. Function takes arguments: a parsed list of created levels schemas, a level parser and a constructor of object, which responsible for rendering the game in the browser (Promise will be resolved, when player passes all levels).
loadLevels()
  .then(encodedSchemas => JSON.parse(encodedSchemas))
  .then(schemas => runGame(schemas, parser, DOMDisplay))
  .then(() => alert(`Congratulations! You won!`));
