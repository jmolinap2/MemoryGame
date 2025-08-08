
document.addEventListener('DOMContentLoaded', () => {
    const wordDisplay = document.querySelector('.word-display');
    const guessesText = document.querySelector('.guesses span');
    const keyboard = document.querySelector('.keyboard');
    const resetButton = document.getElementById('reset-btn');

    let currentWord = '';
    let guessedLetters = [];
    let wrongGuesses = 0;

    function newGame() {
        currentWord = words[Math.floor(Math.random() * words.length)];
        guessedLetters = [];
        wrongGuesses = 0;
        guessesText.textContent = 6;
        renderWord();
        renderKeyboard();
    }

    function renderWord() {
        wordDisplay.innerHTML = '';
        currentWord.split('').forEach(letter => {
            const letterElement = document.createElement('div');
            letterElement.classList.add('letter');
            letterElement.textContent = guessedLetters.includes(letter) ? letter : '';
            wordDisplay.appendChild(letterElement);
        });
    }

    function renderKeyboard() {
        keyboard.innerHTML = '';
        'abcdefghijklmnopqrstuvwxyz'.split('').forEach(key => {
            const keyElement = document.createElement('button');
            keyElement.classList.add('key');
            keyElement.textContent = key;
            keyElement.addEventListener('click', () => handleGuess(key));
            keyboard.appendChild(keyElement);
        });
    }

    function handleGuess(letter) {
        if (guessedLetters.includes(letter)) return;

        guessedLetters.push(letter);

        if (currentWord.includes(letter)) {
            renderWord();
            if (currentWord.split('').every(l => guessedLetters.includes(l))) {
                setTimeout(() => alert('¡Has ganado!'), 100);
            }
        } else {
            wrongGuesses++;
            guessesText.textContent = 6 - wrongGuesses;
            if (wrongGuesses === 6) {
                setTimeout(() => alert(`¡Has perdido! La palabra era ${currentWord}`), 100);
            }
        }
    }

    resetButton.addEventListener('click', newGame);

    // Cargar el script de palabras y luego iniciar el juego
    const script = document.createElement('script');
    script.src = 'games/hangman/words.js';
    script.onload = () => {
        newGame();
    };
    document.body.appendChild(script);
});
