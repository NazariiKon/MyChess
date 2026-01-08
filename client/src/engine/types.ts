export type Position = [number, number];

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export type Color = 'white' | 'black';

export interface Move {
    from: Position;
    to: Position;
}

export interface Piece {
    type: PieceType;
    color: Color;
    position: Position;
}

export type Board = (Piece | null)[][]