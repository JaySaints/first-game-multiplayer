import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import createGame from './public/game.js';

const app = express();
const httpServer = http.createServer(app);
const sockets = new Server(httpServer);

app.use(express.static('public'));

const game = createGame();
game.start();

game.subscribe((command) => {
    console.log(`> Emitting ${command.type}`);
    sockets.emit(command.type, command);
});


sockets.on('connection', (socket) => {
    const playerId = socket.id;
    console.log(`> Player connected on Server with id ${playerId}`);

    game.addPlayer({playerId});

    socket.emit('setup', game.state);
    
    socket.on('disconnect', () => {
        game.removePlayer({playerId});
        console.log(`> Player disconected: ${playerId}`);
    });

    socket.on('move-player', (command) => {
        command.playerId = playerId;
        command.type = "move-player";
        game.movePlayer(command);
    })
});


httpServer.listen(3000, () => {
    console.log('\u2705 Server listing on port 3000');
});