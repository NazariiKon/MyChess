from fastapi import FastAPI
from src.api.main import api_router
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="My chess")
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)



board = [
    ["r","n","b","q","k","b","n","r"],
    ["p","p","p","p","p","p","p","p"],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    ["P","P","P","P","P","P","P","P"],
    ["R","N","B","Q","K","B","N","R"]
]

def print_board(board):
    for r in board:
        for c in r:
            print(c, end = '')
        print("")
    
def make_move(board, move: Move):
    board[move.to_row][move.to_col] = board[move.from_row][move.from_col]
    board[move.from_row][move.from_col] = " "
    return board
    

def is_valid_pawn_move(board, move: Move, color: str):
    if not (0 <= move.from_row < 8):
        print("Error: from_row out of bounds")
        return False

    if not (0 <= move.from_col < 8):
        print("Error: from_col out of bounds")
        return False

    if not (0 <= move.to_row < 8):
        print("Error: to_row out of bounds")
        return False

    if not (0 <= move.to_col < 8):
        print("Error: to_col out of bounds")
        return False

    if not (move.from_col == move.to_col):
        print("Error: pawn can't go on side")
        return False
    
    max_step = 1
    if (move.from_row == 1 and color == "white") or (move.from_row == 6 and color == "black"):
        max_step = 2

    if abs(move.from_row - move.to_row) > max_step:
        print(f"Error: Maximum number of cells that this pawn can do is: {max_step}")
        return False
        
    for r in range(move.from_row + 1, move.to_row):
        if board[r][move.from_col] != " ":
            print("Error: there is another figure on the way")
            return False

    return True

if __name__ == "__main__":
    uvicorn.run("main:app", reload = True)