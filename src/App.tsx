import React, { useState, useEffect, useCallback } from 'react';
import { generateSudoku, Board, BLANK } from './utils/sudoku';
import { RefreshCw, Check, Eraser } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';

export default function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [puzzle, setPuzzle] = useState<Board>([]);
  const [board, setBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isSolved, setIsSolved] = useState(false);

  const startNewGame = useCallback(() => {
    const { puzzle: newPuzzle, solution: newSolution } = generateSudoku(difficulty);
    setPuzzle(newPuzzle);
    setBoard(newPuzzle.map(row => [...row]));
    setSolution(newSolution);
    setSelectedCell(null);
    setIsSolved(false);
  }, [difficulty]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleCellClick = (row: number, col: number) => {
    if (isSolved) return;
    setSelectedCell([row, col]);
  };

  const checkWin = useCallback((currentBoard: Board) => {
    if (solution.length === 0) return;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c] === BLANK || currentBoard[r][c] !== solution[r][c]) {
          return;
        }
      }
    }
    setIsSolved(true);
  }, [solution]);

  const handleInput = useCallback((num: number) => {
    if (!selectedCell || isSolved) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== BLANK) return; // Cannot edit fixed cells

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);

    checkWin(newBoard);
  }, [board, puzzle, selectedCell, isSolved, checkWin]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isSolved) return;
    
    if (e.key >= '1' && e.key <= '9') {
      handleInput(parseInt(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      handleInput(BLANK);
    } else if (selectedCell) {
      const [row, col] = selectedCell;
      if (e.key === 'ArrowUp' && row > 0) setSelectedCell([row - 1, col]);
      if (e.key === 'ArrowDown' && row < 8) setSelectedCell([row + 1, col]);
      if (e.key === 'ArrowLeft' && col > 0) setSelectedCell([row, col - 1]);
      if (e.key === 'ArrowRight' && col < 8) setSelectedCell([row, col + 1]);
    }
  }, [handleInput, selectedCell, isSolved]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getCellClasses = (row: number, col: number) => {
    let classes = "w-full aspect-square flex items-center justify-center text-lg sm:text-2xl font-semibold cursor-pointer select-none transition-colors ";
    
    // Borders
    classes += "border border-slate-300 ";
    if (row % 3 === 0) classes += "border-t-2 border-t-slate-800 ";
    if (row === 8) classes += "border-b-2 border-b-slate-800 ";
    if (col % 3 === 0) classes += "border-l-2 border-l-slate-800 ";
    if (col === 8) classes += "border-r-2 border-r-slate-800 ";

    const isFixed = puzzle[row] && puzzle[row][col] !== BLANK;
    const value = board[row] && board[row][col];
    const isSelected = selectedCell && selectedCell[0] === row && selectedCell[1] === col;
    
    let isRelated = false;
    let isSameValue = false;
    
    if (selectedCell) {
      const [sRow, sCol] = selectedCell;
      if (sRow === row || sCol === col || (Math.floor(sRow / 3) === Math.floor(row / 3) && Math.floor(sCol / 3) === Math.floor(col / 3))) {
        isRelated = true;
      }
      if (value !== BLANK && board[sRow] && board[sRow][sCol] === value) {
        isSameValue = true;
      }
    }

    const isError = value !== BLANK && !isFixed && solution.length > 0 && value !== solution[row][col];

    // Colors
    if (isSelected) {
      classes += "bg-indigo-200 ";
    } else if (isSameValue) {
      classes += "bg-indigo-300 ";
    } else if (isRelated) {
      classes += "bg-indigo-50 ";
    } else {
      classes += "bg-white ";
    }

    if (isFixed) {
      classes += "text-slate-900 ";
    } else if (isError) {
      classes += "text-red-500 ";
    } else {
      classes += "text-indigo-600 ";
    }

    return classes;
  };

  if (board.length === 0) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sudoku</h1>
          <div className="flex space-x-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
                  difficulty === d 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-1 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-9 w-full">
            {board.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellClasses(rowIndex, colIndex)}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell !== BLANK ? cell : ''}
                </div>
              ))
            ))}
          </div>
        </div>

        {isSolved && (
          <div className="mb-6 p-4 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-medium shadow-sm">
            <Check className="w-5 h-5 mr-2" />
            Puzzle Solved! Great job!
          </div>
        )}

        <div className="grid grid-cols-5 gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleInput(num)}
              disabled={isSolved}
              className="aspect-square bg-white border border-slate-200 rounded-xl text-2xl font-semibold text-slate-800 shadow-sm hover:bg-slate-50 hover:border-indigo-300 active:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleInput(BLANK)}
            disabled={isSolved}
            className="aspect-square bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-200 active:bg-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eraser className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={startNewGame}
            className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
