const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
    const store = getStore({ name: 'memory-game' });
    const key = 'best-score';

    if (event.httpMethod === 'GET') {
        const bestScore = await store.get(key, { type: 'json' });
        return {
            statusCode: 200,
            body: JSON.stringify({ bestScore }),
        };
    }

    if (event.httpMethod === 'POST') {
        const { score } = JSON.parse(event.body);
        const currentBest = await store.get(key, { type: 'json' });

        if (currentBest === null || score < currentBest) {
            await store.set(key, score);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Puntuación actualizada exitosamente.', bestScore: score }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'La puntuación no es mejor que la actual.', bestScore: currentBest }),
        };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
};