enum Item {
    BlankSpace = 0,
    MealItem = 1,
    WormHead = 2,
    WormPart = 3,
    WormTail = 4,
    Worm2Head = 5,
    Worm2Part = 6,
    Worm2Tail = 7
};

enum Direction {
    UP = '1',
    DOWN = '-1',
    RIGHT = '2',
    LEFT = '-2'
};

enum State {
    PAUSE = "1",
    CONTINUE = "-1"
};


let message: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById("message");
message.innerHTML = "Press tab to start..."

let keyDetectedPlayer1: Direction = Direction.UP
let keyDetectedPlayer2: Direction = Direction.UP
let stateGame = State.PAUSE;

document.onkeydown = (e) => {
    e.preventDefault()
    switch (e.key) {
        case "ArrowUp": {
            keyDetectedPlayer1 = Direction.UP
            break;
        }
        case "ArrowDown": {
            keyDetectedPlayer1 = Direction.DOWN
            break;
        }
        case "ArrowRight": {
            keyDetectedPlayer1 = Direction.RIGHT
            break;
        }
        case "ArrowLeft": {
            keyDetectedPlayer1 = Direction.LEFT
            break;
        }
        case "W":
        case "w": {
            keyDetectedPlayer2 = Direction.UP
            break;
        }
        case "s":
        case "S": {
            keyDetectedPlayer2 = Direction.DOWN
            break;
        }
        case "D":
        case "d": {
            keyDetectedPlayer2 = Direction.RIGHT
            break;
        }
        case "A":
        case "a": {
            keyDetectedPlayer2 = Direction.LEFT
            break;
        }
        case " ": {
            if (stateGame == State.PAUSE) {
                stateGame = State.CONTINUE;
            } else {
                stateGame = State.PAUSE;
            }
            break;
        }
    }
}


class WormComponent {

    x: number = 0;
    y: number = 0;
    type: Item = Item.WormHead;

    constructor(x: number, y: number, type: number) {
        this.x = x;
        this.y = y;
        this.type = type;
    }

}

function directionIncrement(direction: Direction) {
    switch (direction) {
        case Direction.UP: {
            return [0, -1]
        }
        case Direction.DOWN: {
            return [0, 1]
        }
        case Direction.LEFT: {
            return [-1, 0]
        }
        case Direction.RIGHT: {
            return [1, 0]
        }
    }
}

function getItemByPlayer(playerNumber: number, itemDesired: Item) {
    switch (itemDesired) {
        case Item.WormHead: {
            return playerNumber == 0 ? Item.WormHead : Item.Worm2Head
        }
        case Item.WormPart: {
            return playerNumber == 0 ? Item.WormPart : Item.Worm2Part
        }
        case Item.WormTail: {
            return playerNumber == 0 ? Item.WormTail : Item.Worm2Tail
        }
    }
    return itemDesired
}

class Worm {

    parts: WormComponent[] = [];
    lastMovement: Direction = Direction.UP;
    playerNumber: number = 0;

    constructor(x: number, y: number, playerNumber: number) {
        this.playerNumber = playerNumber
        this.parts.push(new WormComponent(x, y, getItemByPlayer(this.playerNumber, Item.WormHead)));
    }

    eat() {
        let incr = directionIncrement(this.lastMovement)
        if (this.parts.length == 1) {
            let x = this.parts[0].x + incr[0] * (-1), y = this.parts[0].y + incr[1] * (-1)
            this.parts.push(new WormComponent(x, y, getItemByPlayer(this.playerNumber, Item.WormTail)))
            return [x, y]
        }
        this.parts[this.parts.length - 1].type = getItemByPlayer(this.playerNumber, Item.WormPart)
        let x = this.parts[this.parts.length - 1].x + incr[0] * (-1), y = this.parts[this.parts.length - 1].y + incr[1] * (-1)
        this.parts.push(new WormComponent(x, y, getItemByPlayer(this.playerNumber, Item.WormTail)))
        return [x, y]
    }


    move(direction: Direction) {
        let incr = directionIncrement(direction)
        let x = this.parts[0].x + incr[0], y = this.parts[0].y + incr[1]
        this.propagateMovement(x, y)
        this.lastMovement = direction
        return [x, y]
    }

    propagateMovement(x: number, y: number) {
        for (let i = this.parts.length - 1; i > 0; i--) {
            this.parts[i].x = this.parts[i - 1].x
            this.parts[i].y = this.parts[i - 1].y
        }
        this.parts[0].x = x
        this.parts[0].y = y
    }

    checkAutoColision() {
        let headX = this.parts[0].x, headY = this.parts[0].y
        for (let i = 1; i < this.parts.length - 1; i++) {
            if (headX == this.parts[i].x && headY == this.parts[i].y) {
                return true
            }
        }
        return false
    }

    checkColisionWith(worm: Worm) {
        let headX = this.parts[0].x, headY = this.parts[0].y
        for (let element of worm.parts) {
            if (element.x == headX && element.y == headY)
                return true
        }
        return false
    }

}

class MealComponent {
    x: number = 0
    y: number = 0
    type: Item = Item.MealItem

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    draw(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number) {
        ctx.fillStyle = "yellow"
        ctx.fillRect(this.x * scaleX, this.y * scaleY, scaleX, scaleY);
    }

}

class Meals {

    elements: Map<string, MealComponent> = new Map<string, MealComponent>()

    getKey(x: number, y: number) {
        return x.toString().concat(y.toString())
    }

    push(x: number, y: number) {
        this.elements.set(this.getKey(x, y), new MealComponent(x, y))
    }

    delete(x: number, y: number) {
        this.elements.delete(this.getKey(x, y))
    }

    draw(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number) {
        for (let key of this.elements.keys())
            this.elements.get(key)?.draw(ctx, scaleX, scaleY)
    }

}

class Game {

    width: number = 10
    height: number = 10
    worm: Worm = new Worm(0, 0, 0)
    worm2: Worm = new Worm(10, 10, 1)
    meals: Meals = new Meals()
    score: number = 0
    score2: number = 0
    board: Item[][] = []
    winner: number = 0

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.worm = new Worm(Math.round(width / 2), Math.round(height / 2), 0)
        this.worm2 = new Worm(Math.round(width / 2), height, 1)
        this.meals = new Meals()
        this.initBoard()
    }

    generateMeal(number: number) {
        for (let i = 0; i < number; i++) {
            let x = Math.round(Math.random() * this.width)
            let y = Math.round(Math.random() * this.height)
            if (this.board[x][y] == Item.BlankSpace) {
                this.board[x][y] = Item.MealItem
                this.meals.push(x, y)
            }
        }
    }

    createBlankBoard() {
        let x = new Array(this.height)
        for (let i = 0; i < x.length; i++) {
            x[i] = new Array(this.width)
        }
        for (const element of x) {
            for (let j = 0; j < element.length; j++) {
                element[j] = Item.BlankSpace
            }
        }
        this.board = x
    }

    initBoard() {
        this.createBlankBoard()
        this.board[this.worm.parts[0].x][this.worm.parts[0].y] = Item.WormHead
        this.generateMeal(40)
    }

    updateWormsInBoard() {
        for (const element of this.worm.parts)
            this.board[element.x][element.y] = element.type
        for (const element of this.worm2.parts)
            this.board[element.x][element.y] = element.type
    }

    updateMealsInBoard() {
        for (const [_, element] of this.meals.elements){
            this.board[element.x][element.y] = element.type
        }
    }

    updateBoard() {
        this.createBlankBoard()
        this.updateWormsInBoard()
        this.updateMealsInBoard()
    }

    checkBoundedHead(worm: Worm) {
        if (worm.parts[0].x < 0) {
            worm.parts[0].x = this.width - 1;
        }
        if (worm.parts[0].x >= this.width) {
            worm.parts[0].x = 0;
        }
        if (worm.parts[0].y < 0) {
            worm.parts[0].y = this.height - 1;
        }
        if (worm.parts[0].y >= this.height) {
            worm.parts[0].y = 0;
        }
    };

    performAction(movement: Direction, movement2: Direction) {
        let head = this.worm.move(movement)
        let head2 = this.worm2.move(movement2)
        this.checkBoundedHead(this.worm)
        this.checkBoundedHead(this.worm2)
        if (this.board[head[0]][head[1]] == Item.MealItem) {
            this.worm.eat()
            this.meals.delete(head[0], head[1])
            this.generateMeal(1)
            this.score++
        }
        if (this.board[head2[0]][head2[1]] == Item.MealItem) {
            this.worm2.eat()
            this.meals.delete(head2[0], head2[1])
            this.generateMeal(1)
            this.score2++
        }
        if (this.worm.checkColisionWith(this.worm2)) {
            this.winner = 2
            stateGame = State.PAUSE
            return
        }
        if (this.worm2.checkColisionWith(this.worm)) {
            this.winner = 1
            stateGame = State.PAUSE
        }
    }

    draw() {
        let canvas = <HTMLCanvasElement>document.getElementById("tutorial");
        let ctx = canvas.getContext("2d");
        if (ctx == null) {
            return;
        }
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        let scaleX: number = Math.round(canvas.width / this.width), scaleY: number = Math.round(canvas.height / this.height)

        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                let item = this.board[i][j]
                switch (item) {
                    case Item.BlankSpace: {
                        break;
                    }
                    case Item.MealItem: {
                        ctx.fillStyle = "yellow"
                        ctx.fillRect(i * scaleX, j * scaleY, scaleX, scaleY);
                        break;
                    }
                    case Item.WormHead: {
                        ctx.fillStyle = "black"
                        ctx.fillRect(i * scaleX, j * scaleY, scaleX, scaleY);
                        break;
                    }
                    case Item.WormPart: {
                        ctx.fillStyle = "gray"
                        ctx.fillRect(i * scaleX, j * scaleY, scaleX, scaleY);
                        break;
                    }
                    case Item.WormTail: {
                        ctx.fillStyle = "red"
                        ctx.fillRect(i * scaleX, j * scaleY, scaleX, scaleY);
                        break;
                    }
                    case Item.Worm2Head: {
                        ctx.fillStyle = "blue"
                        ctx.fillRect(i * scaleX, j * scaleY, scaleX, scaleY);
                        break;
                    }
                    case Item.Worm2Part: {
                        ctx.fillStyle = "pink"
                        ctx.fillRect(i * scaleX, j * scaleY, scaleX, scaleY);
                        break;
                    }
                    case Item.Worm2Tail: {
                        ctx.fillStyle = "purple"
                        ctx.fillRect(i * scaleX, j * scaleY, scaleX, scaleY);
                        break;
                    }
                }
            }
        }

        if (this.winner == 0) {
            message.innerHTML = "Score  Player1: ".concat(this.score.toString()).concat(" Player2: ").concat(this.score2.toString())
        } else if (this.winner == 1) {
            message.innerHTML = "Winner player 1"
        } else if (this.winner == 2) {
            message.innerHTML = "Winner player 2"
        }
    }

}

let game = new Game(40, 40)

function update() {
    if (stateGame == State.PAUSE) {
        message.innerHTML = "Press tab to continue..."
        return;
    }
    game.performAction(keyDetectedPlayer1, keyDetectedPlayer2)
    game.updateBoard()
    game.draw()
    if (game.winner != 0) {
        game = new Game(40, 40)
    }
}

function init() {
    setInterval(update, 100)
}

init()