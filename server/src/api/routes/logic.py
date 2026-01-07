from fastapi import APIRouter
from fastapi import Depends

from src.chess.models import Move
from src.chess.engine import ChessGame

games: dict[str, ChessGame] = {}

def get_game(game_id: str = "default"):
    if game_id not in games:
        games[game_id] = ChessGame()
    return games[game_id]

router = APIRouter(prefix="/chess", tags=["Chess logic"])

@router.get("/board/{game_id}")
def board(game_id: str, game: ChessGame = Depends(get_game)):
    return {"board": game.get_board(), "isWhiteTurn": game.isWhiteTurn}

@router.post("/makestep/{game_id}")
def makestep(game_id: str, move: Move, game: ChessGame = Depends(get_game)):
    return game.make_move(move)