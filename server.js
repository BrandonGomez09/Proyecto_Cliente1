const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let numberToGuess = Math.floor(Math.random() * 100) + 1;
let guesses = [];

app.use(express.static('public'));
app.use(express.json());

//Long Polling

app.get('/guess', (req, res) => {
  const initialLength = guesses.length;
  const checkForNewGuesses = setInterval(() => {
    if (guesses.length > initialLength) {
      res.json(guesses);
      clearInterval(checkForNewGuesses);
    }
  }, 1000);
});

//Short Pollingn y web
app.post('/guess', (req, res) => {
  const guess = req.body.guess;
  const result = {
    guess,
    message: guess == numberToGuess ? '¡Correcto!' : guess > numberToGuess ? 'Muy alto' : 'Muy bajo'
  };
  guesses.push(result);
  res.json(result);
  io.emit('newGuess', result);
});

app.post('/reset', (req, res) => {
  numberToGuess = Math.floor(Math.random() * 100) + 1;
  guesses = [];
  io.emit('reset');
  res.json({ message: 'Juego reiniciado' });
});


//web Socket
io.on('connection', (socket) => {
  socket.emit('initialGuesses', guesses);
  socket.on('newGuess', (guess) => {
    const result = {
      guess,
      message: guess == numberToGuess ? '¡Correcto!' : guess > numberToGuess ? 'Muy alto' : 'Muy bajo'
    };
    guesses.push(result);
    io.emit('newGuess', result);
  });
});

server.listen(3000, () => {
  console.log('El servidor está ejecutándose en http://localhost:3000');
});
