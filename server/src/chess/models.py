from pydantic import BaseModel


class Position(BaseModel):
    row: int
    col: int

class Move(BaseModel):
    from_row: int
    from_col: int
    to_row: int
    to_col: int