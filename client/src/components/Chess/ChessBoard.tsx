import { useGameId } from "@/hooks/useGameId";
import React, { useEffect, useState } from "react";

type Board = string[][];

export const ChessBoard: React.FC = () => {
    const [gameId, newGame] = useGameId();
    const [isWhiteTurn, setIsWhiteTurn] = useState<boolean>(true);
    // const [board, setBoard] = useState<Board>([]);
    // const [availableSteps, setAvailableSteps] = useState<[number, number][]>([]);
    // const [currentPiece, setCurrentPiece] = useState<[number | null, number | null]>([null, null]);
    const [error, setError] = useState<string | null>(null);
    const [currentPieceName, setCurrentPieceName] = useState<string | null>(null);

    const [currentPiece, setCurrentPiece] = useState<[number, number] | null>(null);
    const [availableSteps, setAvailableSteps] = useState<number[][]>([]);
    const [board, setBoard] = useState<string[][]>([]);

    const handlePieceClick = async (piece: string, row: number, col: number) => {
        if (availableSteps.some(([sr, sc]) => sr === row && sc === col)) {
            if (!currentPiece || !currentPieceName) return;
            if (isWhiteTurn && currentPieceName === currentPieceName.toLowerCase()) return;
            if (!isWhiteTurn && currentPieceName === currentPieceName.toUpperCase()) return;

            const res = await makeStep(row, col);
            if (res.Error) {
                setError(res.Error);
                return;
            }

            setBoard(res.board);
            setIsWhiteTurn(res.isWhiteTurn);
            setCurrentPiece(null);
            setCurrentPieceName(null);
            setAvailableSteps([]);
            return;
        }

        if (piece !== " ") {
            setCurrentPiece([row, col]);
            setCurrentPieceName(piece);
            const steps = await getSteps(row, col);
            setAvailableSteps(steps || []);
            setError(null);
        } else {
            setCurrentPiece(null);
            setCurrentPieceName(null);
            setAvailableSteps([]);
        }
    };


    const renderPiece = (piece: string) => {
        const isWhite = piece === piece.toUpperCase();
        switch (piece.toLowerCase()) {
            case "p": return isWhite ? "♙" : "♟";
            case "r": return isWhite ? "♖" : "♜";
            case "n": return isWhite ? "♘" : "♞";
            case "b": return isWhite ? "♗" : "♝";
            case "q": return isWhite ? "♕" : "♛";
            case "k": return isWhite ? "♔" : "♚";
            default: return null;
        }
    };

    const getSteps = async (row: number, col: number) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/chess/steps/${gameId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ row, col })
        });
        return (await res.json()).steps;
    };

    const makeStep = async (row: number, col: number) => {
        if (!currentPiece) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/chess/makestep/${gameId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ from_row: currentPiece[0], from_col: currentPiece[1], to_row: row, to_col: col }),
        });
        if (!res.ok) return false;
        return (await res.json());
    };

    const onNewGameClick = () => {
        newGame();
        setAvailableSteps([]);
        return;
    };

    useEffect(() => {
        if (!gameId) return;

        fetch(`${import.meta.env.VITE_API_URL}/chess/board/${gameId}`)
            .then(res => res.json())
            .then(data => {
                setBoard(data.board);
                console.log('isWhiteTurn:', data.isWhiteTurn);
            });
    }, [gameId, import.meta.env.VITE_API_URL]);


    if (board.length === 0) return <div className="text-gray-500 text-xl p-4">Loading board...</div>;

    return (
        <div>
            {error && <div className="text-red-500 text-xl p-4">Error: {error}</div>}
            <p>{isWhiteTurn ? 'White ♔' : 'Black ♚'}</p>
            <button onClick={() => onNewGameClick()} className="mb-4 p-2 bg-blue-500 text-white rounded">
                New Game
            </button>
            <div className="w-[480px] h-[480px] border-4 border-black shadow-2xl rounded-lg overflow-hidden">
                <div className="w-full h-full grid grid-cols-8 grid-rows-8 bg-black">
                    {board.map((row, r) =>
                        row.map((piece, c) => (
                            <div
                                key={`${r}-${c}`}
                                className={`
                                flex items-center justify-center
                                text-3xl font-bold cursor-pointer select-none
                                ${availableSteps.some(([sr, sc]) => sr === r && sc === c) ? "bg-green-400" : ""}
                                ${piece.trim() !== "" ? "hover:scale-105 transition-transform" : ""}
                                ${(r + c) % 2 === 0 ? "bg-[#f0d9b5]" : "bg-[#b58863]"}
                            `}
                                onClick={() => handlePieceClick(piece, r, c)}
                            >
                                {piece.trim() !== "" && renderPiece(piece)}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
