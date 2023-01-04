// Factory
export default function createGame() {
    const state = {
        players: {},
        fruits: {},
        screen: {
            width: 10,
            height: 10
        }
    }

    const observers = [];

    function start() {
        const frequency = 7000;
        setInterval(addFruit, frequency);
    }

    // Subject    
    function subscribe(observerFunction) {
        observers.push(observerFunction);
    }

    function notifyAll(command) {
        console.log(`> CreateGame->NotifyAll-> ${observers.length} observes`);

        for (const observerFunction of observers) {
            observerFunction(command);
        }
    }

    function setState(newState) {
        Object.assign(state, newState);
    }

    function addPlayer(command) {
        const playerId = command.playerId;
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width);
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height);
        
        state.players[playerId] = {
            playerX, 
            playerY
        }

        notifyAll({
            type: 'add-player',
            playerId,
            playerX,
            playerY
        });
    }

    function removePlayer(command) {
        delete state.players[command.playerId];

        notifyAll({
            type: "remove-player",
            playerId: command.playerId
        });
    }

    function addFruit(command) {
        const fruitId = command ? command.fruitId : Math.floor(Math.random() * 100000);
        const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width);
        const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height);

        state.fruits[fruitId] = {
            fruitX,
            fruitY
        }

        notifyAll({
            type: "add-fruit",
            fruitId,
            fruitX,
            fruitY
        });
    }

    function removeFruit(command) {
        delete state.fruits[command.fruitId];

        notifyAll({
            type: "remove-fruit",
            fruitId: command.fruitId
        });
    }

    function movePlayer(command) {        
        notifyAll(command);

        const acceptMoves = {
            ArrowUp(player) {
                player.playerY = Math.max(player.playerY - 1, 0);
            },
            ArrowDown(player) {
                player.playerY = Math.min(player.playerY + 1, state.screen.height - 1);
            },
            ArrowRight(player) {
                player.playerX = Math.min(player.playerX + 1, state.screen.width - 1);
            },
            ArrowLeft(player) {
                player.playerX = Math.max(player.playerX - 1, 0);
            }
        }

        const keyPressed = command.keyPressed;
        const playerId = command.playerId;
        const player = state.players[playerId];
        const moveFunction = acceptMoves[keyPressed];

        if (player && moveFunction) {
            console.log(`> CreateGame->MovePlayer-> ${command.playerId} with ${command.keyPressed}`);
            moveFunction(player)
            detectFruitCollision(playerId)
        }
    }

    function detectFruitCollision(playerId) {
        const player = state.players[playerId];

        for (const fruit in state.fruits) {
            if (state.fruits[fruit].fruitX == player.playerX && state.fruits[fruit].fruitY == player.playerY) {
                console.log(`CreateGame->DetectFruitColision-> ${playerId} <-> ${fruit}`);
                removeFruit({ fruitId: fruit });
            }
        }
    }

    return {
        addPlayer,
        removePlayer,
        movePlayer,
        addFruit,
        removeFruit,
        setState,
        subscribe,
        start,
        state
    }
}