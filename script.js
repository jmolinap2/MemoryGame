
document.addEventListener('DOMContentLoaded', () => {
    const themeSelect = document.getElementById('theme-select');
    const gameSelect = document.getElementById('game-select');
    const gameContainer = document.getElementById('game-container');

    // Cargar el tema guardado
    const savedTheme = localStorage.getItem('theme') || 'system';
    themeSelect.value = savedTheme;
    document.body.setAttribute('data-theme', savedTheme);

    // Cambiar el tema
    themeSelect.addEventListener('change', () => {
        const selectedTheme = themeSelect.value;
        document.body.setAttribute('data-theme', selectedTheme);
        localStorage.setItem('theme', selectedTheme);
    });

    // Cargar un juego
    function loadGame(gameName) {
        fetch(`games/${gameName}/index.html`)
            .then(response => response.text())
            .then(html => {
                gameContainer.innerHTML = html;
                // Cargar el script del juego
                const script = document.createElement('script');
                script.src = `games/${gameName}/script.js`;
                document.body.appendChild(script);

                // Cargar el css del juego
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = `games/${gameName}/style.css`;
                document.head.appendChild(link);
            });
    }

    // Cargar el juego seleccionado
    gameSelect.addEventListener('change', () => {
        const selectedGame = gameSelect.value;
        loadGame(selectedGame);
    });

    // Cargar el juego de memoria por defecto
    loadGame('memory');
});
