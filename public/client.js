const socket = io();

const boardElements = document.querySelectorAll('.cell');
const messageElement = document.getElementById('message');
const restartButton = document.getElementById('restart-button');

let currentPlayer = 0;

boardElements.forEach((cell, index) => {
  cell.addEventListener('click', () => {
    if (!cell.textContent && currentPlayer === 0) {
      socket.emit('move', index);
    }
  });
});

socket.emit('join');

socket.on('update', ({ board, currentPlayer }) => {
  boardElements.forEach((cell, index) => {
    cell.textContent = board[index] === 0 ? 'X' : board[index] === 1 ? 'O' : '';
  });

  currentPlayer === 0
    ? (messageElement.textContent = "Turno de X")
    : (messageElement.textContent = "Turno de O");
});

socket.on('win', (player) => {
  messageElement.textContent = `¡Jugador ${player === 0 ? 'X' : 'O'} ha ganado!`;
});

socket.on('draw', () => {
  messageElement.textContent = '¡Empate!';
});

restartButton.addEventListener('click', () => {
  socket.emit('restart');
});

socket.on('reset', () => {
  boardElements.forEach((cell) => (cell.textContent = ''));
  messageElement.textContent = '';
  currentPlayer = 0;
});

socket.on('player', (playerNumber) => {
  currentPlayer = playerNumber;
  messageElement.textContent = `Eres el jugador ${playerNumber === 0 ? 'X' : 'O'}`;
  restartButton.style.display = 'block';
});