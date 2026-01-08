import ChessEngine from "@/engine/ChessEngine"
import type { Color, Move, Piece } from '@/engine/types';

export default class RandomBot {
    private chessService: ChessEngine;

    constructor(chess: ChessEngine) {
        this.chessService = chess;
    }

    private getRandomFigure(color: Color): Piece | null {
        const pieces = this.chessService.getPieces("black");
        if (pieces.length === 0) return null;
        return pieces[Math.floor(Math.random() * pieces.length)];
    }

    private makeRandomMove(piece: Piece): Move | null {
        const legalMoves = this.chessService.getMoves(piece);
        if (legalMoves.length === 0) return null;

        const randomTo = legalMoves[Math.floor(Math.random() * legalMoves.length)];

        return {
            from: piece.position,
            to: randomTo
        };
    }

    public makeBotMove(): Move | null {
        const color = "black";
        const allLegalMoves: Move[] = [];

        const pieces = this.chessService.getPieces(color);
        for (const piece of pieces) {
            const legalMoves = this.chessService.getMoves(piece);
            legalMoves.forEach(to => {
                allLegalMoves.push({ from: piece.position, to });
            });
        }

        if (allLegalMoves.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * allLegalMoves.length);
        return allLegalMoves[randomIndex];
    }

}