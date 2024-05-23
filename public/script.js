const guessInput = document.getElementById('guessInput');
const guessButton = document.getElementById('guessButton');
const resetButton = document.getElementById('resetButton');
const guessesList = document.getElementById('guessesList');

const socket = io();

// Short Polling
setInterval(() => {
  fetch('/guess')
    .then(response => response.json())
    .then(data => {
      guessesList.innerHTML = ''; 
      data.forEach(displayGuess);
    });
}, 5000);

// Long Polling
function longPolling() {
  fetch('/guess')
    .then(response => response.json())
    .then(data => {
      guessesList.innerHTML = '';
      data.forEach(displayGuess);
      longPolling(); 
    });
}
longPolling();

guessButton.addEventListener('click', () => {
  const guess = guessInput.value;
  if (guess) {
    fetch('/guess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ guess })
    })
    .then(response => response.json())
    .then(result => {
      displayGuess(result);
    });
    guessInput.value = '';
  }
});

resetButton.addEventListener('click', () => {
  fetch('/reset', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
      console.log(data.message); 
    });
});

socket.on('initialGuesses', (initialGuesses) => {
  initialGuesses.forEach(displayGuess);
});

socket.on('newGuess', (result) => {
  displayGuess(result);
});

socket.on('reset', () => {
  guessesList.innerHTML = '';
});

function displayGuess(result) {
  const li = document.createElement('li');
  li.textContent = `Número: ${result.guess} - ${result.message}`;
  guessesList.appendChild(li);
}


