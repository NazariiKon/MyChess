from fastapi import APIRouter
from pydantic import BaseModel

class Position(BaseModel):
    row: int
    col: int

class Move(BaseModel):
    from_row: int
    from_col: int
    to_row: int
    to_col: int

router = APIRouter(prefix="/chess", tags=["Chess logic"])

current_game = [
    ["r","n","b","q","k","b","n","r"],
    ["p","p","p","p","p","p","p","p"],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," ","B"," "," "," "],
    [" "," "," "," "," "," "," "," "],
    ["P","P","P","P","P","P","P","P"],
    ["R","N"," ","Q","K","B","N","R"]
]

def get_current_board():
    return [row[:] for row in current_game]

@router.get("/board")
def board():
    return {"board": get_current_board()}

def queen_steps(isWhite, row, col):
    res = []

    res += bishop_steps(isWhite, row, col)
    res += rock_steps(isWhite, row, col)

    return res

def bishop_steps(isWhite, row, col):
    if isWhite: check = str.islower 
    else: check = str.isupper

    res = []

    for dr, dc in ((1, 1), (1, -1), (-1, -1), (-1, 1)):
        r = row + dr
        c = col + dc

        while 0 <= r < 8 and 0 <= c < 8:
            target = current_game[r][c]

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

def rock_steps(isWhite, row, col):
    if isWhite: check = str.islower 
    else: check = str.isupper

    res = []

    for dr, dc in ((1,0), (-1,0), (0,1), (0,-1)):
        r = row + dr
        c = col + dc

        while 0 <= r < 8 and 0 <= c < 8:
            target = current_game[r][c]

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

def knight_steps(isWhite, row, col):
    if isWhite: check = str.islower 
    else: check = str.isupper
    
    res = []
    for (cr, cc) in (2, -1), (2, 1), (-2, -1), (-2, 1), (1, 2), (-1, 2), (1, -2), (-1, -2):
        if not (0 <= row + cr < 8 and 0 <= col + cc < 8): continue
        target = current_game[row + cr][col + cc]
        if target == " " or check(target):
            res.append([row + cr, col + cc])
    
    return res

def pawn_steps(isWhite, row, col):
    if row == 7 or row == 0: return None
    if isWhite: 
        rc = cc = -1
        check = str.islower 
    else: 
        rc = cc = 1
        check = str.isupper
        
    res = []
    
    # First step
    if row == 1 and not isWhite and current_game[row + 1][col] == " " and current_game[row + 2][col] == " ":
        res.append([row + 2, col])
    elif row == 6 and isWhite and current_game[row - 1][col] == " " and current_game[row - 2][col] == " ":
        res.append([row - 2, col])
    
    # Step
    if current_game[row + rc][col] == " ":
        res.append([row + rc, col])

    # Eat left piece
    if col > 0 and check(current_game[row + rc][col + cc]):
        res.append([row + rc, col + cc])
    # Eat right piece
    if col < 7 and check(current_game[row + rc][col - cc]):
        res.append([row + rc, col - cc])

    return res

def calculate_steps(piece, row, col):
    match piece:
        case "p" | "P":
            return pawn_steps(piece == "P", row, col)
        case "r" | "R":
            return rock_steps(piece == "R", row, col)
        case "n" | "N":
            return knight_steps(piece == "N", row, col)
        case "b" | "B":
            return bishop_steps(piece == "B", row, col)
        case "q" | "Q":
            return queen_steps(piece == "Q", row, col)
        case "k" | "K":
            pass
            

@router.post("/steps")
def get_steps(position: Position) -> dict:
    row, col = position.row, position.col
    piece = current_game[row][col]
    steps = calculate_steps(piece, row, col)
    return {"steps": steps}

@router.post("/makestep")
def makestep(move: Move) -> dict:
    piece = current_game[move.from_row][move.from_col]
    available_steps = calculate_steps(piece, move.from_row, move.from_col)
    if [move.to_row, move.to_col] not in available_steps:
       return {"Error": "invalid move"}
    current_game[move.to_row][move.to_col] = piece
    current_game[move.from_row][move.from_col] = " "
    return {"board": get_current_board()}