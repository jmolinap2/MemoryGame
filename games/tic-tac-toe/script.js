
document.addEventListener('DOMContentLoaded', () => {
    const board = document.querySelector('.board');
    const resetButton = document.getElementById('reset-btn');
    let currentPlayer = 'X';
    let cells = Array(9).fill(null);

    function createBoard() {
        board.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
        }
    }

    function handleCellClick(e) {
        const index = e.target.dataset.index;
        if (cells[index]) return;

        cells[index] = currentPlayer;
        e.target.textContent = currentPlayer;

        if (checkWinner()) {
            setTimeout(() => alert(`${currentPlayer} ha ganado!`), 100);
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }

    function checkWinner() {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winningCombinations.some(combination => {
            return combination.every(index => cells[index] === currentPlayer);
        });
    }

    function resetGame() {
        cells = Array(9).fill(null);
        currentPlayer = 'X';
        createBoard();
    }

    resetButton.addEventListener('click', resetGame);

    createBoard();
});
