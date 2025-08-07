document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const splashScreen = document.getElementById('splash-screen');
    const startGameBtn = document.getElementById('start-game-btn');
    const mainContent = document.querySelector('.main-content');
    const gameBoard = document.querySelector('.memory-game');
    const movesCountSpan = document.getElementById('moves-count');
    const bestScoreSpan = document.getElementById('best-score');
    const resetGameBtn = document.getElementById('reset-game-btn');

    // Íconos y configuración del juego
    const squidGameIcons = ['Ο', 'Δ', '▢', '☆', '☂️', '🦑', '💰', '👤']; // Círculo, Triángulo, Cuadrado, Estrella, Paraguas, Calamar, Dinero, Máscara
    const cardValues = [...squidGameIcons, ...squidGameIcons];
    const BEST_SCORE_KEY = 'memoryGameBestScore';
    const API_URL = '/api/best-score'; // Endpoint para la Netlify Function

    // Estado del juego
    let moves = 0;
    let cardsFlipped = 0;
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;

    // --- Lógica de Inicio y UI ---

    // Evento para iniciar el juego desde el portal
    startGameBtn.addEventListener('click', () => {
        splashScreen.classList.add('hide');
        document.body.classList.remove('no-scroll');
        mainContent.style.display = 'flex';
        initializeGame();
    });

    // Evento para reiniciar el juego
    resetGameBtn.addEventListener('click', restartGame);

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
            loadBestScore(); // Recargar la puntuación desde el servidor
        } catch (error) {
            console.error('Error al actualizar la mejor puntuación:', error);
        }
    }

    // --- Lógica Principal del Juego ---

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

        // Comprobar si el juego ha terminado
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
    
    function restartGame() {
        // Oculta las cartas con una animación antes de reiniciar
        const cards = document.querySelectorAll('.memory-card');
        cards.forEach(card => card.classList.remove('flip'));
        lockBoard = true; // Bloquea el tablero durante la animación

        setTimeout(() => {
            initializeGame();
        }, 600); // Espera a que la animación de volteo termine
    }
});
