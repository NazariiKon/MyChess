from fastapi import APIRouter
from pydantic import BaseModel
from fastapi import Depends

class Position(BaseModel):
    row: int
    col: int

class Move(BaseModel):
    from_row: int
    from_col: int
    to_row: int
    to_col: int

default_board = [
    ["r","n","b","q","k","b","n","r"],
    ["p","p","p","p","p","p","p","p"],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    ["P","P","P","P","P","P","P","P"],
    ["R","N","B","Q","K","B","N","R"]
]

class ChessGame:
    def __init__(self):
        self.board = [row[:] for row in default_board]
        self.isWhiteTurn = True

    def get_board_copy(self):
        return [[self.board[r][c] for c in range(8)] for r in range(8)]

    def get_board(self):
        return [row[:] for row in self.board]

    def make_move(self, move: Move):
        piece = self.board[move.from_row][move.from_col]
        if self.isWhiteTurn and piece.islower():
            return {"Error": "White's turn"}
        if not self.isWhiteTurn and piece.isupper():
            return {"Error": "Black's turn"}
        board_cpy = self.get_board_copy()
        status = None
        self.isWhiteTurn = not self.isWhiteTurn
        steps = self.calculate_steps(move.from_row, move.from_col)
        if [move.to_row, move.to_col] not in steps:
            return {"Error": "Invalid move"}
        self.board[move.to_row][move.to_col] = piece
        self.board[move.from_row][move.from_col] = " "

        if self.is_in_check(not self.isWhiteTurn):
            self.isWhiteTurn = not self.isWhiteTurn
            self.board = board_cpy
            if self.is_checkmate():
                return {"Error": "Game Over"}
            
            return {
                "board": self.get_board(),
                "isWhiteTurn": self.isWhiteTurn,
                "Error": "Save your king!"
            }
        
        if self.is_in_check(self.isWhiteTurn):
            if self.is_checkmate():
                status = "Game Over"
            
        return {
            "board": self.get_board(),
            "isWhiteTurn": self.isWhiteTurn,
            "status": status or "normal"
        }
    
    def is_checkmate(self) -> bool:
        if not self.is_in_check(self.isWhiteTurn):
            return False
        
        # Тестим каждый возможный ход текущей стороны
        for fr in range(8):
            for fc in range(8):
                piece = self.board[fr][fc]
                if (self.isWhiteTurn and piece.islower()) or (not self.isWhiteTurn and piece.isupper()):
                    continue  # чужая фигура
                    
                moves = self.calculate_steps(fr, fc)
                for to_pos in moves:
                    tr, tc = to_pos
                    
                    # Undo-тест
                    saved_from = self.board[fr][fc]
                    saved_to = self.board[tr][tc]
                    
                    self.board[tr][tc] = saved_from
                    self.board[fr][fc] = " "
                    
                    still_check = self.is_in_check(self.isWhiteTurn)  # шах остался?
                    
                    # Откат
                    self.board[fr][fc] = saved_from
                    self.board[tr][tc] = saved_to
                    
                    if not still_check:  # есть спасительный ход!
                        return False
        
        return True  # все ходы оставляют шах


    def find_piece(self, target):
        pos = None
        for r in range(8):
            for c in range(8):
                if self.board[r][c] == target:
                    return [r, c]

    def is_in_check(self, white: bool):
        target = "K" if white else "k"
        king_pos = self.find_piece(target)

        opponent_color = str.islower if white else str.isupper

        for r in range(8):
            for c in range(8):
                piece = self.board[r][c]
                if piece != " " and opponent_color(piece):
                    attacks = self.calculate_steps(r, c)
                    print(f"{piece}({r},{c}) attacks: {attacks}")
                    if king_pos in attacks:
                        print("CHECK!")
                        return True
        print("No check")
        return False




    def king_steps(self, isWhite, row, col):
        if isWhite: check = str.islower
        else: check = str.isupper
        res = []

        for dr, dc in (1, -1), (1, 1), (1, 0), (0, 1), (0, -1), (-1, -1), (-1, 1), (-1, 0):
            r = row + dr
            c = col + dc

            if not(0 <= r < 8 and 0 <= c < 8): continue
            target = self.board[r][c]
            if target == " ":
                res.append([r, c])
            elif check(target):
                res.append([r, c])
                continue

        return res

    def queen_steps(self, isWhite, row, col):
        res = []

        res += self.bishop_steps(isWhite, row, col)
        res += self.rock_steps(isWhite, row, col)

        return res

    def bishop_steps(self, isWhite, row, col):
        if isWhite: check = str.islower
        else: check = str.isupper

        res = []

        for dr, dc in ((1, 1), (1, -1), (-1, -1), (-1, 1)):
            r = row + dr
            c = col + dc

            while 0 <= r < 8 and 0 <= c < 8:
                target = self.board[r][c]

                if target == " ":
                    res.append([r, c])
                elif check(target):
                    res.append([r, c])
                    break
                else:
                    break

                r += dr
                c += dc

        return res

    def rock_steps(self, isWhite, row, col):
        if isWhite: check = str.islower
        else: check = str.isupper

        res = []

        for dr, dc in ((1,0), (-1,0), (0,1), (0,-1)):
            r = row + dr
            c = col + dc

            while 0 <= r < 8 and 0 <= c < 8:
                target = self.board[r][c]

                if target == " ":
                    res.append([r, c])
                elif check(target):
                    res.append([r, c])
                    break
                else:
                    break

                r += dr
                c += dc

        return res

    def knight_steps(self, isWhite, row, col):
        if isWhite: check = str.islower
        else: check = str.isupper

        res = []
        for (cr, cc) in (2, -1), (2, 1), (-2, -1), (-2, 1), (1, 2), (-1, 2), (1, -2), (-1, -2):
            if not (0 <= row + cr < 8 and 0 <= col + cc < 8): continue
            target = self.board[row + cr][col + cc]
            if target == " " or check(target):
                res.append([row + cr, col + cc])

        return res

    def pawn_steps(self, isWhite, row, col):
        if row == 7 or row == 0: return None
        if isWhite:
            rc = cc = -1
            check = str.islower
        else:
            rc = cc = 1
            check = str.isupper

        res = []

        # First step
        if row == 1 and not isWhite and self.board[row + 1][col] == " " and self.board[row + 2][col] == " ":
            res.append([row + 2, col])
        elif row == 6 and isWhite and self.board[row - 1][col] == " " and self.board[row - 2][col] == " ":
            res.append([row - 2, col])

        # Step
        if self.board[row + rc][col] == " ":
            res.append([row + rc, col])

        diag_row = row + rc  # куда бьём

        # Левое взятие (col-1)
        if col > 0 and check(self.board[diag_row][col - 1]):
            res.append([diag_row, col - 1])

        # Правое взятие (col+1)
        if col < 7 and check(self.board[diag_row][col + 1]):
            res.append([diag_row, col + 1])

        return res

    def calculate_steps(self, row, col):
        piece = self.board[row][col]
        if piece == " ":
            return []
        res = []
        match piece:
            case "p" | "P":
                res = self.pawn_steps(piece == "P", row, col)
            case "r" | "R":
                res = self.rock_steps(piece == "R", row, col)
            case "n" | "N":
                res = self.knight_steps(piece == "N", row, col)
            case "b" | "B":
                res = self.bishop_steps(piece == "B", row, col)
            case "q" | "Q":
                res = self.queen_steps(piece == "Q", row, col)
            case "k" | "K":
                res = self.king_steps(piece == "K", row, col)

        return res

games: dict[str, ChessGame] = {}

def get_game(game_id: str = "default"):
    if game_id not in games:
        games[game_id] = ChessGame()
    return games[game_id]

router = APIRouter(prefix="/chess", tags=["Chess logic"])

def get_current_board():
    return [row[:] for row in default_board]

@router.get("/board/{game_id}")
def board(game_id: str, game: ChessGame = Depends(get_game)):
    return {"board": game.get_board(), "isWhiteTurn": game.isWhiteTurn}

@router.post("/makestep/{game_id}")
def makestep(game_id: str, move: Move, game: ChessGame = Depends(get_game)):
    return game.make_move(move)

@router.post("/steps/{game_id}")
def get_steps(game_id: str, position: Position, game: ChessGame = Depends(get_game)):
    row, col = position.row, position.col
    piece = game.board[row][col]
    if piece == " ":
        return {"steps": []}
    steps = game.calculate_steps(row, col)
    return {"steps": steps}