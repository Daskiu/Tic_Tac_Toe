const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname + '/public')));

io.on('connection', (socket) => {
    console.log('A user connected');
  let players = [];
  let currentPlayer = 0;
  const board = ['', '', '', '', '', '', '', '', ''];

  const checkWinner = (player) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const pattern of winPatterns) {
      if (pattern.every((index) => board[index] === player)) {
        return true;
      }
    }

    return false;
  };

  socket.on('move', (position) => {
    if (players[currentPlayer] === socket.id && !board[position]) {
      board[position] = currentPlayer;

      io.emit('update', { board, currentPlayer });

      if (checkWinner(currentPlayer)) {
        io.emit('win', currentPlayer);
      } else if (board.every((cell) => cell !== '')) {
        io.emit('draw');
      } else {
        currentPlayer = 1 - currentPlayer;
      }
    }
  });

  socket.on('join', () => {
    if (players.length < 2) {
      players.push(socket.id);
      socket.emit('player', players.length - 1);
    }
  });

  socket.on('restart', () => {
    board.fill('');
    currentPlayer = 0;
    io.emit('reset');
  });

  socket.on('disconnect', () => {
    const playerIndex = players.indexOf(socket.id);
    if (playerIndex !== -1) {
      players.splice(playerIndex, 1);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});