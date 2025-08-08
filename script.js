document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const splashScreen = document.getElementById('splash-screen');
    const startGameBtn = document.getElementById('start-game-btn');
    const mainContent = document.querySelector('.main-content');
    const gameTitle = document.getElementById('game-title');
    const themeSelector = document.getElementById('theme-selector');
    const memoryWrapper = document.getElementById('memory-game-wrapper');
    const guessWrapper = document.getElementById('guess-game-wrapper');
    const gameBoard = document.querySelector('.memory-game');
    const movesCountSpan = document.getElementById('moves-count');
    const bestScoreSpan = document.getElementById('best-score');
    const resetGameBtn = document.getElementById('reset-game-btn');
    const guessInput = document.getElementById('guess-input');
    const guessBtn = document.getElementById('guess-btn');
    const guessFeedback = document.getElementById('guess-feedback');
    const guessAttemptsSpan = document.getElementById('guess-attempts');

    // Manejo de temas
    const themeClasses = ['theme-light','theme-dark','theme-gothic','theme-squid','theme-thrones','theme-potter'];
    function applyTheme(theme) {
        document.body.classList.remove(...themeClasses);
        if (theme !== 'system') {
            document.body.classList.add(`theme-${theme}`);
        }
    }

    const savedTheme = localStorage.getItem('theme') || 'system';
    themeSelector.value = savedTheme;
    applyTheme(savedTheme);
    themeSelector.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Selección de juegos
    const games = ['memory', 'guess'];
    let currentGame = null;

    startGameBtn.addEventListener('click', () => {
        splashScreen.classList.add('hide');
        document.body.classList.remove('no-scroll');
        mainContent.style.display = 'flex';
        const random = games[Math.floor(Math.random() * games.length)];
        currentGame = random;
        if (random === 'memory') {
            startMemoryGame();
        } else {
            startGuessGame();
        }
    });

    resetGameBtn.addEventListener('click', () => {
        if (currentGame === 'memory') {
            restartMemoryGame();
        } else {
            startGuessGame();
        }
    });

    // --- Juego "Adivina el Número" ---
    let guessNumber = 0;
    let guessAttempts = 0;

    function startGuessGame() {
        gameTitle.textContent = 'Adivina el Número';
        memoryWrapper.classList.add('hidden');
        guessWrapper.classList.remove('hidden');
        guessNumber = Math.floor(Math.random() * 100) + 1;
        guessAttempts = 0;
        guessAttemptsSpan.textContent = guessAttempts;
        guessFeedback.textContent = '';
        guessInput.value = '';
    }

    function handleGuess() {
        const value = parseInt(guessInput.value, 10);
        if (isNaN(value)) return;
        guessAttempts++;
        guessAttemptsSpan.textContent = guessAttempts;
        if (value === guessNumber) {
            guessFeedback.textContent = '¡Correcto!';
        } else if (value < guessNumber) {
            guessFeedback.textContent = 'Más alto';
        } else {
            guessFeedback.textContent = 'Más bajo';
        }
        guessInput.value = '';
    }

    guessBtn.addEventListener('click', handleGuess);
    guessInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleGuess();
    });

    // --- Juego de Memoria ---
    const squidGameIcons = ['Ο', 'Δ', '▢', '☆', '☂️', '🦑', '💰', '👤'];
    const cardValues = [...squidGameIcons, ...squidGameIcons];
    const BEST_SCORE_KEY = 'memoryGameBestScore';
    const API_URL = '/api/best-score';

    let moves = 0;
    let cardsFlipped = 0;
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;

    async function loadBestScore() {
        const localBest = localStorage.getItem(BEST_SCORE_KEY);
        if (localBest) {
            bestScoreSpan.textContent = `${localBest} mov.`;
        }
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            const bestScore = data.bestScore;
            if (bestScore !== null && bestScore !== undefined) {
                bestScoreSpan.textContent = `${bestScore} mov.`;
                localStorage.setItem(BEST_SCORE_KEY, bestScore);
            }
        } catch (error) {
            console.error('Error al cargar la mejor puntuación:', error);
            if (!localBest) {
                bestScoreSpan.textContent = 'Error';
            }
        }
    }

    async function updateBestScore() {
        const localBest = localStorage.getItem(BEST_SCORE_KEY);
        if (!localBest || moves < parseInt(localBest, 10)) {
            localStorage.setItem(BEST_SCORE_KEY, moves);
        }
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ score: moves }),
            });
            const data = await response.json();
            if (data.bestScore !== undefined) {
                localStorage.setItem(BEST_SCORE_KEY, data.bestScore);
            }
            loadBestScore();
        } catch (error) {
            console.error('Error al actualizar la mejor puntuación:', error);
        }
    }

    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    }

    function createBoard() {
        shuffle(cardValues);
        gameBoard.innerHTML = '';
        cardValues.forEach(value => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.value = value;
            card.innerHTML = `
                <div class="card-front">Ο</div>
                <div class="card-back">${value}</div>
            `;
            card.addEventListener('click', flipCard);
            gameBoard.appendChild(card);
        });
    }

    function flipCard() {
        if (lockBoard || this === firstCard) return;

        this.classList.add('flip');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        incrementMoves();
        checkForMatch();
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.value === secondCard.dataset.value;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        cardsFlipped++;
        resetBoard();

        if (cardsFlipped === squidGameIcons.length) {
            setTimeout(() => {
                updateBestScore();
                alert(`¡Felicidades! Has ganado en ${moves} movimientos.`);
            }, 500);
        }
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetBoard();
        }, 1200);
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    function incrementMoves() {
        moves++;
        movesCountSpan.textContent = moves;
    }

    function resetGameVariables() {
        moves = 0;
        cardsFlipped = 0;
        movesCountSpan.textContent = moves;
        resetBoard();
    }

    function initializeGame() {
        resetGameVariables();
        loadBestScore();
        createBoard();
    }

    function restartMemoryGame() {
        const cards = document.querySelectorAll('.memory-card');
        cards.forEach(card => card.classList.remove('flip'));
        lockBoard = true;
        setTimeout(() => {
            initializeGame();
        }, 600);
    }

    function startMemoryGame() {
        gameTitle.textContent = 'Juego de Memoria';
        guessWrapper.classList.add('hidden');
        memoryWrapper.classList.remove('hidden');
        initializeGame();
    }
});

