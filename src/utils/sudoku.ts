export type Board = number[][];

export const BLANK = 0;

export function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(BLANK));
}

export function isValid(board: Board, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num && i !== col) return false;
    if (board[i][col] === num && i !== row) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num && (startRow + i !== row || startCol + j !== col)) {
        return false;
      }
    }
  }
  return true;
}

function fillDiagonal(board: Board) {
  for (let i = 0; i < 9; i += 3) {
    fillBox(board, i, i);
  }
}

function fillBox(board: Board, rowStart: number, colStart: number) {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
  let index = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[rowStart + i][colStart + j] = nums[index++];
    }
  }
}

function solve(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === BLANK) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (let num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = BLANK;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export function generateSudoku(difficulty: 'easy' | 'medium' | 'hard'): { puzzle: Board, solution: Board } {
  const board = createEmptyBoard();
  fillDiagonal(board);
  solve(board);
  
  const solution = board.map(row => [...row]);
  const puzzle = board.map(row => [...row]);
  
  let attempts = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 55;
  
  while (attempts > 0) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    while (puzzle[row][col] === BLANK) {
      row = Math.floor(Math.random() * 9);
      col = Math.floor(Math.random() * 9);
    }
    puzzle[row][col] = BLANK;
    attempts--;
  }
  
  return { puzzle, solution };
}
