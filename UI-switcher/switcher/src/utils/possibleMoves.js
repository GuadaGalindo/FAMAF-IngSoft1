const moveTypes = {
  mov01: [[2, 2]],
  mov02: [[0, 2]],
  mov03: [[0, 1]],
  mov04: [[1, 1]],
  mov05: [[-2, 1]],
  mov06: [[-2, -1]],
  mov07: [[0, 4]],
};

function getRotations([dx, dy]) {
  return [
    [dx, dy],
    [-dy, dx],
    [-dx, -dy],
    [dy, -dx]
  ];
}

export default function calculatePossibleMoves(row, col, moveType) {
  const moves = new Set();

  const selectedMoves = moveTypes[moveType];

  selectedMoves.forEach(([dx, dy]) => {
    const rotations = getRotations([dx, dy]);

    rotations.forEach(([rMove, cMove]) => {
      const newRow = row + rMove;
      const newCol = col + cMove;

      if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 6) {
        const positionKey = `${newRow},${newCol}`;
        moves.add(positionKey);
      }
    });
  });

  return Array.from(moves).map((pos) => {
    const [row, col] = pos.split(',').map(Number);
    return { row, col };
  });
}