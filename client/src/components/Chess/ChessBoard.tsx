import { useGameId } from "@/hooks/useGameId";
import React, { useEffect, useState } from "react";
import ChessEngine from "@/engine/ChessEngine"
import RandomBot from "@/engine/RandomBot"
import { getBoard } from "@/api/chess"
import type { Board, Move, Piece, Position } from '@/engine/types';


export const ChessBoard: React.FC = () => {
    const [gameId, newGame] = useGameId();
    const [isWhiteTurn, setIsWhiteTurn] = useState<boolean>(true);
    const [status, setStatus] = useState<string>("normal");
    const [error, setError] = useState<string | null>(null);
    const [chess, setChess] = useState<ChessEngine>(new ChessEngine())
    const [board, setBoard] = useState<Board | null>(null)
    const [bot, setBot] = useState<RandomBot | null>(null)
    const [selectedPiece, setCurrentPiece] = useState<Piece | null>(null);
    const [availableSteps, setAvailableSteps] = useState<number[][]>([]);

    const handlePieceClick = async (piece: Piece | null, row: number, col: number) => {
        if (availableSteps.some(([sr, sc]) => sr === row && sc === col)) {
            await makeMove([row, col]);
            // if (bot) {
            //     const botMove = bot.makeBotMove();
            //     console.log(botMove);
            //     if (botMove) {
            //         console.log("1. BotMove", botMove);
            //         console.log(chess.makeMove(botMove));
            //         setBoard(chess.getBoard());
            //         setIsWhiteTurn(true);
            //     }
            // }
            return;
        }

        if (piece) {
            setCurrentPiece(piece);
            if (isWhiteTurn && piece.color === "black" || !isWhiteTurn && piece.color === "white") return;

            const steps = chess.getMoves(piece)
            setAvailableSteps(steps || []);
            setError(null);
        } else {
            setCurrentPiece(null);
            setAvailableSteps([]);
        }
    };

    const makeMove = async (to: Position) => {
        if (!selectedPiece) return;
        if ((isWhiteTurn && selectedPiece.color === "black") || (!isWhiteTurn && selectedPiece.color === "white")) return;

        const move: Move = {
            from: [selectedPiece.position[0], selectedPiece.position[1]],
            to: [to[0], to[1]]
        };

        // const res = await makeStep(move, gameId);
        await chess.makeMove(move);
        // if (res.Error) {
        //     setError(res.Error);
        //     return;
        // }

        // chess.setBoard(res.board);
        setIsWhiteTurn(!isWhiteTurn);
        setCurrentPiece(null);
        setAvailableSteps([]);

        // switch (res.status) {
        //     case "Game Over": {
        //         var winner = "Black"
        //         if (isWhiteTurn)
        //             winner = "White"

        //         setStatus("Game Over!");
        //         break;
        //     }
        //     case "check": {
        //         setStatus("check");
        //         break;
        //     }
        //     case "normal":
        //         setStatus("normal");
        //         break;
        // }

        return;
    }

    const renderPiece = (piece: Piece) => {
        switch (piece.type) {
            case "p": return piece.color == "white" ? "♙" : "♟";
            case "r": return piece.color == "white" ? "♖" : "♜";
            case "n": return piece.color == "white" ? "♘" : "♞";
            case "b": return piece.color == "white" ? "♗" : "♝";
            case "q": return piece.color == "white" ? "♕" : "♛";
            case "k": return piece.color == "white" ? "♔" : "♚";
            default: return null;
        }
    };

    const onNewGameClick = () => {
        newGame();
        setChess(new ChessEngine());
        setAvailableSteps([]);
        setIsWhiteTurn(true);
        return;
    };

    useEffect(() => {
        const loadBoard = async () => {
            if (!gameId) return;
            const res = await getBoard(gameId)
            if (!res || !res.board) return;
            setChess(new ChessEngine(res.board));
            setIsWhiteTurn(res.isWhiteTurn);
        };
        // loadBoard();
        setBoard(chess.getBoard());
        setBot(new RandomBot(chess));
    }, [gameId, board, import.meta.env.VITE_API_URL]);

    if (!board || board.length === 0) return <div className="text-gray-500 text-xl p-4">Loading board...</div>;

    return (
        <div>
            {error && <div className="text-red-500 text-xl p-4">Error: {error}</div>}
            <p>{isWhiteTurn ? 'White ♔' : 'Black ♚'}</p>
            {status === "check" && <p>Check!</p>}
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
                                ${piece !== null ? "hover:scale-105 transition-transform" : ""}
                                ${(r + c) % 2 === 0 ? "bg-[#f0d9b5]" : "bg-[#b58863]"}
                            `}
                                onClick={() => handlePieceClick(piece, r, c)}
                            >
                                {piece !== null && renderPiece(piece)}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
