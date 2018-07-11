'use strict';
<<<<<<< HEAD

=======
>>>>>>> 8036fbb772f720e0a888db19c9b6cfc3e901fbdf
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error(`Можно прибавлять к вектору только вектор типа: Vector!`);
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
      throw new Error(`Аргумент position, size или speed объекта типа: Actor, может быть передан только вектором типа: Vector!`);
    }
    this.pos = position;
    this.size = size;
    this.speed = speed;
  }

  get left() {
    return this.pos.x;;
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
      throw new Error(`Движущийся объект actor может быть передан только объектом типа Actor, и не равен undefined!`);
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
      throw new Error(`Движущийся объект actor может быть передан только объектом типа: Actor, и не равен undefined!`);
    } 
    return this.actors.find((otherActor) => otherActor.isIntersect(actor));
  }

  obstacleAt(position, size) {
    if ((!(position instanceof Vector)) || (!(size instanceof Vector)))  {
      throw new Error(`Аргумент Позиции или Размера объекта типа Actor может быть передан только вектором типа Vector!`);
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
    const grid = [];
    lvlScheme.forEach((schemeLine) => (grid.push(schemeLine.split('').map((charOfObstacle) => (this.obstacleFromSymbol(charOfObstacle))))));
    return grid;
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
    return new Vector(this.left, this.top).plus(this.speed.times(time));
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
    this[Symbol('FireRainsStartPos')] = position;  
  }
  
  handleObstacle() {
    const SymbolOfFireRainsStartPos = Object.getOwnPropertySymbols(this)[0];
    this.pos = this[SymbolOfFireRainsStartPos];
    this.speed = this.speed;
  }
}

class Coin extends Actor {
  constructor(position = new Vector()) {
    super(position = position.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6), new Vector());
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * 2 * Math.PI;
    this[Symbol('CoinsStartPos')] = position; 
  } 

  get type() {
    return 'coin';
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
    const SymbolOfCoinsStartPos = Object.getOwnPropertySymbols(this)[0];
    return this[SymbolOfCoinsStartPos].plus(springVector);
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



// Добавляем словарь, и заполняем его движущимися объектами:
const actorDict = {
  '@': Player, // Игрок, объект
  'o': Coin, // Монетка, объект
  '=': HorizontalFireball, // Движущаяся горизонтально шаровая молния, объект
  '|': VerticalFireball, // Движущаяся вертикально шаровая молния, объект
  'v': FireRain // Огненный дождь, объект
}

// Добавляем парсер уровней игры из написанных схем:
const parser = new LevelParser(actorDict);

// Загружем написанные схемы уровней (промис разрешится JSON-строкой, в которой закодирован массив схем написанных уровней),
// Парсим полученную JSON-строку (функция возвращает массив строк - список схем написанных уровней),
// Запускаем игру. В качестве аргументов функция принимает: спарсенный список схем уровней, парсер уровней и конструктор объекта, отвечающего за отрисовку игры в браузере (промис разрешится, когда игрок пройдет все уровни).
loadLevels()
  .then(schemasCode => JSON.parse(schemasCode))
  .then(schemas => runGame(schemas, parser, DOMDisplay))
  .then(() => alert(`Поздравляем, Вы прошли игру!`));
