import { useState, useEffect } from 'react';

export const useGameId = (): [string, () => void] => {
    const [gameId, setGameId] = useState<string>('');

    useEffect(() => {
        let id = localStorage.getItem('chessGameId') ||
            new URLSearchParams(window.location.search).get('game') ||
            '';

        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('chessGameId', id);
        }

        setGameId(id);
    }, []);

    const newGame = () => {
        const newId = crypto.randomUUID();
        localStorage.setItem('chessGameId', newId);
        setGameId(newId);
        window.history.replaceState({}, '', `?game=${newId}`);
    };

    return [gameId, newGame];
};
