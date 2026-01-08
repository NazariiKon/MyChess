import type { Move } from "@/engine/types";

export const getBoard = async (gameId: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/chess/board/${gameId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!res.ok) return null;
    return (await res.json());
}

export const makeStep = async (move: Move, gameId: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/chess/makestep/${gameId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ from_row: move.from[0], from_col: move.from[1], to_row: move.to[0], to_col: move.to[1] }),
    });
    if (!res.ok) return false;
    return (await res.json());
};