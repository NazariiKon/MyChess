import React, { useEffect, useState } from "react";

type Board = string[][];

export const ChessBoard: React.FC = () => {
    const [board, setBoard] = useState<Board>([]);
    const [availableSteps, setAvailableSteps] = useState<[number, number][]>([]);
    const [currentPiece, setCurrentPiece] = useState<[number | null, number | null]>([null, null]);
    const [error, setError] = useState<string | null>(null);

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

    const handlePieceClick = async (piece: string, row: number, col: number) => {
        setAvailableSteps([])
        if (availableSteps.some(([sr, sc]) => sr === row && sc === col)) {
            if (currentPiece[0] == null || currentPiece[1] == null) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/chess/makestep`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ from_row: currentPiece[0], from_col: currentPiece[1], to_row: row, to_col: col }),
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setBoard(Array.isArray(data) ? data : data.board || []);
                setError(null);
            }
            catch (err) {

            }
        }
        else {
            if (piece == " ") return;
            try {
                console.log(row, col)
                setCurrentPiece([row, col])
                console.log(currentPiece)
                const res = await fetch(`${import.meta.env.VITE_API_URL}/chess/steps`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ row, col }),
                });

                const data = await res.json();
                if (!data.steps) return;
                console.log(data)
                setAvailableSteps(data.steps)
                setError(null);
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Can't load board");
            }
        }
    };

    useEffect(() => {
        const loadBoard = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/chess/board`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setBoard(Array.isArray(data) ? data : data.board || []);
                setError(null);
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Can't load board");
            }
        };

        loadBoard();

        // const interval = setInterval(loadBoard, 2000);

        return;
    }, []);


    if (error) return <div className="text-red-500 text-xl p-4">Error: {error}</div>;
    if (board.length === 0) return <div className="text-gray-500 text-xl p-4">Loading board...</div>;

    return (
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
    );
};
