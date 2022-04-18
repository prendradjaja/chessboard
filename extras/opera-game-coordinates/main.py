import chess.pgn

from string import ascii_lowercase


abcdefgh = 'abcdefgh'

pgn = open("opera-game.pgn")

game = chess.pgn.read_game(pgn)

# Iterate through all moves and play them on a board.
board = game.board()
for move in game.mainline_moves():
    uci = move.uci()
    startfile, startrank, endfile, endrank = uci

    # Parse and map to "row (down+), col (right+)" coordinate system (zero-indexed)
    startrank = 7 - (int(startrank) - 1)
    endrank   = 7 - (int(endrank)   - 1)
    startfile = ascii_lowercase.index(startfile)
    endfile   = ascii_lowercase.index(endfile)

    print(f'{{ start: [{startrank}, {startfile}], end: [{endrank}, {endfile}] }},')
