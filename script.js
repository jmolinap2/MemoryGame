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
        mainContent.style.display = 'flex';
        initializeGame();
    });

    // Evento para reiniciar el juego
    resetGameBtn.addEventListener('click', restartGame);

    function loadBestScore() {
        const bestScore = localStorage.getItem(BEST_SCORE_KEY);
        bestScoreSpan.textContent = bestScore ? `${bestScore} mov.` : '-';
    }

    function updateBestScore() {
        const bestScore = localStorage.getItem(BEST_SCORE_KEY);
        if (!bestScore || moves < parseInt(bestScore)) {
            localStorage.setItem(BEST_SCORE_KEY, moves);
            bestScoreSpan.textContent = `${moves} mov.`;
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
