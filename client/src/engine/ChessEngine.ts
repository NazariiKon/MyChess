import type {
    Position,
    PieceType,
    Color,
    Piece
} from './types';

class ChessEngine {
    private static readonly DEFAULT_BOARD =
        [["r", "n", "b", "q", "k", "b", "n", "r"],
        ["p", "p", "p", "p", "p", "p", "p", "p"],
        [" ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " "],
        ["P", "P", "P", "P", "P", "P", "P", "P"],
        ["R", "N", "B", "Q", "K", "B", "N", "R"]]

    private board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    private isWKingMoved: boolean = false;
    private isBKingMoved: boolean = false;

    constructor(board?: string[][]) {
        if (board) {
            this.setBoard(board);
        } else {
            this.setBoard(ChessEngine.DEFAULT_BOARD);
        }
    }

    public setBoard(board: string[][]): void {
        this.board = board.map((row, rowIdx) =>
            row.map((pieceStr, colIdx) => {
                if (pieceStr === ' ') return null;
                const type = pieceStr.toLowerCase() as PieceType;
                const color: Color = pieceStr === pieceStr.toUpperCase() ? 'white' : 'black';
                const position: Position = [rowIdx, colIdx];

                return { type, color, position } as Piece;
            })
        );
    }

    public getBoard(): (Piece | null)[][] {
        return this.board;
    }

    private isValidPosition(row: number, col: number): boolean {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    private getPawnMoves(row: number, col: number, color: Color): Position[] {
        const moves: Position[] = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Single forward move
        const nextRow = row + direction;
        if (this.isValidPosition(nextRow, col) && !this.board[nextRow][col]) {
            moves.push([nextRow, col]);

            // Double move from start
            if (row === startRow) {
                const doubleRow = row + 2 * direction;
                if (!this.board[doubleRow][col]) moves.push([doubleRow, col]);
            }
        }

        // Captures
        [-1, 1].forEach(colDelta => {
            const newCol = col + colDelta;
            if (this.isValidPosition(nextRow, newCol) && this.board[nextRow][newCol]?.color !== color) {
                moves.push([nextRow, newCol]);
            }
        });

        return moves;
    }

    private getKnightMoves(row: number, col: number, color: Color): Position[] {
        const deltas = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        return deltas
            .map(([r, c]) => [row + r, col + c] as Position)
            .filter(([r, c]) => this.isValidPosition(r, c) && this.board[r][c]?.color !== color);
    }

    private getSlidingMoves(row: number, col: number, color: Color, directions: Position[]): Position[] {
        const moves: Position[] = [];
        directions.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                const [r, c] = [row + dr * i, col + dc * i];
                if (!this.isValidPosition(r, c)) break;
                if (this.board[r][c]?.color === color) break;
                moves.push([r, c]);
                if (this.board[r][c]) break;
            }
        });
        return moves;
    }

    private getBishopMoves(row: number, col: number, color: Color): Position[] {
        return this.getSlidingMoves(row, col, color, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
    }

    private getRookMoves(row: number, col: number, color: Color): Position[] {
        return this.getSlidingMoves(row, col, color, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
    }

    private getQueenMoves(row: number, col: number, color: Color): Position[] {
        return this.getSlidingMoves(row, col, color, [
            [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
        ]);
    }

    private getKingMoves(row: number, col: number, color: Color): Position[] {
        const moves: Position[] = [];
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                if (r === 0 && c === 0) continue;
                const [newRow, newCol] = [row + r, col + c];
                if (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol]?.color !== color) {
                    moves.push([newRow, newCol]);
                }
            }
        }
        return moves;
    }

    private isCellUnderAttack(row: number, col: number, color: Color): boolean {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === color) {
                    const attacks = piece.type === 'k'
                        ? this.getKingMoves(r, c, piece.color)
                        : this.getMoves(r, c);

                    if (attacks.some(([ar, ac]) => ar === row && ac === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }


    private getKingCastling(row: number, col: number, color: Color): Position[] {
        const moves: Position[] = [];

        if ((color == "white" && this.isWKingMoved) || (color == "black" && this.isBKingMoved))
            return moves;

        const defaultRow = color == "white" ? 7 : 0;

        if (this.isCellUnderAttack(row, col, "black")) {
            return moves;
        }
        const opponentColor = color === "white" ? "black" : "white"
        let pathOk = true;
        for (let c = 5; c <= 6; c++) {
            if (this.board[defaultRow][c] !== null || this.isCellUnderAttack(defaultRow, c, opponentColor)) {
                pathOk = false;
                break;
            }
        }
        if (pathOk && this.board[defaultRow][7]?.type === 'r' && this.board[defaultRow][7]?.color === color) {
            moves.push([row, col + 2]);
        }

        pathOk = true;
        for (let c = 1; c <= 3; c++) {
            if (this.board[defaultRow][c] !== null || this.isCellUnderAttack(defaultRow, c, opponentColor)) {
                pathOk = false;
                break;
            }
        }
        if (pathOk && this.board[defaultRow][0]?.type === 'r' && this.board[defaultRow][0]?.color === color) {
            moves.push([row, col - 2]);
        }

        return moves;
    }


    getMoves(row: number, col: number): Position[] {
        const piece = this.board[row][col];
        if (!piece) return [];

        switch (piece.type) {
            case 'p': return this.getPawnMoves(row, col, piece.color);
            case 'n': return this.getKnightMoves(row, col, piece.color);
            case 'b': return this.getBishopMoves(row, col, piece.color);
            case 'r': return this.getRookMoves(row, col, piece.color);
            case 'q': return this.getQueenMoves(row, col, piece.color);
            case 'k': return this.getKingMoves(row, col, piece.color).concat(this.getKingCastling(row, col, piece.color));
            default: return [];
        }
    }
}

export default ChessEngine;