function Cell() {
    let value = "";

    const addToken = (player) => {
        value = player;
    };
    const getValue = () => value;

    return {
        addToken, 
        getValue
    };
}

function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const dropToken = (row, column, player) => {
        const chosenRow = row - 1;
        const chosenColumn = column - 1;
   
        if (board[chosenRow][chosenColumn].getValue() !== "") {
            return false; // Move is invalid
        }
        
        board[chosenRow][chosenColumn].addToken(player);

        // Check for win or draw
        if (checkWin(player)) {
            return "win"; // Player has won
        } else if (checkDraw()) {
            return "draw"; // Game ended in a draw
        }

        return true; // Move is valid and game continues
    };

    const checkWin = (player) => {
        const token = player;

        // Check rows
        for (let i = 0; i < rows; i++) {
            if (board[i].every(cell => cell.getValue() === token)) {
                return true;
            }
        }

        // Check columns
        for (let j = 0; j < columns; j++) {
            if (board.every(row => row[j].getValue() === token)) {
                return true;
            }
        }

        // Check diagonals
        if (board.every((row, index) => row[index].getValue() === token)) {
            return true;
        }
        if (board.every((row, index) => row[rows - 1 - index].getValue() === token)) {
            return true;
        }

        return false; // No win
    };

    const checkDraw = () => {
        // Check if all cells are occupied
        return board.every(row => row.every(cell => cell.getValue() !== ""));
    };

    const resetBoard = () => {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                board[i][j] = Cell(); // Reset each cell
            }
        }
    };

    return { 
        getBoard, 
        dropToken, 
        resetBoard
    };
}


function GameController(
    playerOneName = "Player O",
    playerTwoName = "Player X"
) {
    const board = Gameboard();

    const player = [
        {name: playerOneName, token: "O"},
        {name: playerTwoName, token: "X"}
    ];

    let activePlayer = player[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === player[0] ? player[1] : player[0];
    };
    const getActivePlayer = () => activePlayer;

    const playRound = (row, column) => {
        const result = board.dropToken(row, column, getActivePlayer().token);

        if (result === "win") {
            return "win"; // Stop further play
        } else if (result === "draw") {
            return "draw"; // Stop further play
        }

        if (result === false) {
            return false; // Stop further execution
        }

        switchPlayerTurn();
    }

    return {
        playRound,
        getActivePlayer,
        switchPlayerTurn,
        getBoard: board.getBoard,
        resetBoard: board.resetBoard,
    };
}

function ScreenController() {
    const game = GameController();
    const playerTurnDiv = document.querySelector(".playerTurn");
    const boardDiv = document.querySelector(".board");
    const resetButton = document.querySelector(".restart-button");
    let gameActive = true;

    const updateScreen = () => {
        // Clear the board
        boardDiv.textContent = "";
        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        playerTurnDiv.textContent = `${activePlayer.name}'s turn`;

        board.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                cellButton.textContent = cell.getValue();

                cellButton.addEventListener("click", () => {
                    if (!gameActive) return; // Prevent clicks if the game is over

                    const result = game.playRound(rowIndex + 1, columnIndex + 1);
                    updateScreen();

                    if (result === "win") {
                        playerTurnDiv.textContent = `${activePlayer.name} wins!`;
                        gameActive = false; // Stop further play
                        return; // Stop further execution
                    }

                    if (result === "draw") {
                        playerTurnDiv.textContent = "It's a draw!";
                        gameActive = false; // Stop further play
                        return; // Stop further execution
                    }

                    playerTurnDiv.textContent = `${game.getActivePlayer().name}'s turn`;
                });

                boardDiv.appendChild(cellButton);
            });
        });
    };

    resetButton.addEventListener("click", () => {
        game.resetBoard(); // Reset the game state
        gameActive = true; // Reset the active game state
        playerTurnDiv.textContent = `${game.getActivePlayer().name}'s turn`; // Reset turn message
        updateScreen(); // Refresh the display
    });

    updateScreen();
}

ScreenController();