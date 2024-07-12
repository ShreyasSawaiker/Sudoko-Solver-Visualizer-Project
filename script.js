var grid;
var algorithm;
var speed;
var speedInt;
var solution = null;
var inProgress = false;

// Function to convert the HTML structure of the Sudoku board to a 2D array of DOM elements
const grabGrid = () => {
  let grid = [];
  for (let row = 0; row < 9; row++) {
    let currentRow = [];
    let rowElement = document.querySelector(`.row:nth-child(${row + 1})`);
    for (col = 0; col < rowElement.children.length; col++) {
      currentRow.push(rowElement.children[col]);
    }
    grid.push(currentRow);
  }
  return grid;
};


grid = grabGrid();
algorithm = "algorithm-x";
speed = "Fast";
speedInt = 30;

// Function to clear the Sudoku grid
const clearGrid = () => {
  if (inProgress) {
    return;
  }
  grid.forEach((row) =>
    row.forEach((td) => {
      td.className = "";
      td.children[0].value = "";
    })
  );
  solution = null;
};

// // Event listener for the "Clear" button
// const clearGridBtn = document.getElementById("clearBtn");
// clearGridBtn.addEventListener("click", clearGrid);


// Function to generate a Sudoku puzzle
const generatePuzzle = () => {
  if (inProgress) {
    return;
  }
  // Clear the grid before generating a new puzzle
  clearGrid();
  // Fill diagonal sections randomly
  fillDiagonalSectionsRandomly();
  // Solve the puzzle using the backtracking algorithm
  backtracking(grid, 0, true);
  // Store the solved puzzle as the solution
  solution = grid.map((row) =>
    row.map((td) => {
      return td.children[0].value;
    })
  );
  // Delete some cells randomly to create the puzzle
  deleteRandomely();
  // Fix the classes of the cells based on their values
  fixClasses();
};

// Event listener for the "Generate" button
const generateBtn = document.getElementById("generateBtn");
generateBtn.addEventListener("click", generatePuzzle);

// Function to fill diagonal sections of the grid randomly
const fillDiagonalSectionsRandomly = () => {
  let row = 0;
  let col = 0;
  let counter = 0;

  while (row != 9 && col != 9 && counter < 900) {
    counter++;
    let possibleNum = Math.floor(Math.random() * 9) + 1;

    grid[row][col].children[0].value = possibleNum;
    grid[row][col].classList.add("fixed");

    if (row % 3 == 0 && col % 3 == 0) {
      col++;
    } else if (isSquareValid(row, col, grid)) {
      if (col % 3 != 2) {
        col++;
      } else if (col % 3 === 2) {
        if (row % 3 === 2) {
          col++;
        } else {
          col = col - 2;
        }
        row++;
      }
    }
  }
};

// Function to delete cells randomly from the puzzle
const deleteRandomely = () => {
  let cellsToRemoveFromPuzzle = [];
  for (let i = 0; i < 80; i++) {
    let randomCellIdx = Math.floor(Math.random() * 81);
    cellsToRemoveFromPuzzle.push(randomCellIdx);
  }
  let counter = 0;
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (cellsToRemoveFromPuzzle.indexOf(counter) !== -1) {
        grid[row][col].children[0].value = "";
      }
      counter++;
    }
  }
};

// Function to fix the classes of cells based on their values
const fixClasses = () => {
  grid.forEach((row) =>
    row.forEach((td) => {
      if (td.children[0].value) {
        td.className = "fixed";
      } else {
        td.className = "";
      }
    })
  );
};

// Event listeners for algorithm selection
const algorithms = document.querySelectorAll(`#algorithms ~ ul li`);
algorithms.forEach((option) => {
  option.addEventListener("click", (e) => {
    // Update the selected algorithm and reset the grid
    algorithm = e.target.getAttribute("data-value");
    algorithms.forEach((option) => option.classList.remove("active"));
    e.target.classList.add("active");
    console.log(algorithm);
    // Clear the grid cells
    grid.forEach((row) =>
      row.forEach((td) => {
        if (!td.classList.contains("fixed")) {
          td.children[0].value = "";
          td.className = "";
        }
      })
    );
    document.getElementById("algorithms").checked = false;
  });
});

// Event listeners for menu checkboxes
const menus = document.querySelectorAll(`nav li input[type='checkbox']`);
menus.forEach((menu) => {
  menu.addEventListener("click", (e) => {
    // Disable other checkboxes when one is checked
    if (e.target.checked) {
      menus.forEach((menu) => {
        if (menu !== e.target) {
          menu.checked = false;
        }
      });
    }
  });
});

// Event listeners for cell input
grid.forEach((row, rowIdx) =>
  row.forEach((td, colIdx) => {
    td.children[0].addEventListener("input", (e) => {
      // Handle input validation and feedback
      if (e.target.value == "") {
        td.className = "";
        return;
      }
      if (
        ["1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(
          e.target.value
        ) === -1
      ) {
        td.classList.add("wrong");
        setTimeout(() => {
          e.target.value = "";
          td.classList.remove("wrong");
        }, 500);
      } else {
        if (solution) {
          if (td.children[0].value == solution[rowIdx][colIdx]) {
            td.classList.add("correct");
          } else {
            td.classList.add("wrong");
          }
        } else {
          td.classList.add("fixed");
          if (isCellValid(rowIdx, colIdx, grid)) return;
          td.classList.remove("fixed");
          td.classList.add("wrong");
          setTimeout(() => {
            td.classList.remove("wrong");
            e.target.value = "";
          }, 500);
        }
      }
    });
  })
);

// Event listeners for speed selection
const speedBtns = document.querySelectorAll(`#speed ~ ul > li`);
speedBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    // Update the selected speed and reset the grid
    speed = e.target.getAttribute("data-value");
    speedBtns.forEach((option) => option.classList.remove("active"));
    e.target.classList.add("active");
    // Map speed to corresponding speed interval
    switch (speed) {
      case "Fast":
        speedInt -=40;
        break;
      case "Average":
        speedInt += 50;
        break;
      case "Slow":
        speedInt += 100;
        break;
    }
    document.getElementById("speed").checked = false;
  });
});

// Event listener for the "Visualize" button
const visualizeBtn = document.getElementById("visualizeBtn");
visualizeBtn.addEventListener("click", () => {
  // Check if animation is in progress
  if (inProgress) {
    showAlert("Animation in progress", "danger");
    return;
  }
  // Clear the grid before visualization
  grid.forEach((row) =>
    row.forEach((td) => {
      if (!td.classList.contains("fixed")) {
        td.children[0].value = "";
        td.className = "";
      }
    })
  );
  // Set animation in progress flag
  inProgress = true;
  // Call the backtracking algorithm based on the selected algorithm type
  switch (algorithm) {
    case "backtracking":
      return backtracking(grid, speedInt);
    default:
      return backtracking(grid, speedInt);
  }
});

// Backtracking algorithm function
const backtracking = (
  grid,
  speedInt,
  comingFromGenerator = false,
  row = 0,
  col = 0,
  counter = null,
  animationList = null
) => {
  if (!animationList) animationList = [];
  if (!counter) counter = { iteration: 0, startTime: Date.now() };
  counter["iteration"]++;
  if (counter["iteration"] >= 100000) {
    return false;
  }
  if (row === grid.length && col === grid[row].length) {
    clearGrid();
    animate(animationList, speedInt);
    return true;
  }
  let nextEmpty = findNextEmpty(grid, row, col);
  if (!nextEmpty) {
    if (!comingFromGenerator) {
      grid.forEach((row) =>
        row.forEach((td) => {
          if (!td.classList.contains("fixed")) {
            td.children[0].value = "";
          }
        })
      );
      animate(animationList, speedInt);
      let duration = Date.now() - counter["startTime"];
    }
    enableMenu(animationList.length);
    return true;
  }
  let [nextRow, nextCol] = nextEmpty;
  for (let possibleNum = 1; possibleNum <= 9; possibleNum++) {
    grid[nextRow][nextCol].children[0].value = possibleNum;
    animationList.push([nextRow, nextCol, possibleNum, "wrong"]);
    if (isCellValid(nextRow, nextCol, grid)) {
      animationList.push([nextRow, nextCol, possibleNum, "correct"]);
      if (
        backtracking(
          grid,
          speedInt,
          comingFromGenerator,
          nextRow,
          nextCol,
          counter,
          animationList
        )
      )
        return true;
    }
  }
  grid[nextRow][nextCol].children[0].value = "";
  animationList.push([nextRow, nextCol, "", ""]);
  return false;
};

const isRowValid = (grid, rowIdx) => {
  for (let row = 0; row < 9; row++) {
    if (rowIdx === row) {
      let numsInRow = {};
      for (col = 0; col < 9; col++) {
        if (
          grid[rowIdx][col].children[0].value &&
          numsInRow[grid[rowIdx][col].children[0].value]
        ) {
          return false;
        } else if (grid[rowIdx][col].children[0].value) {
          numsInRow[grid[rowIdx][col].children[0].value] = true;
        }
      }
      return true;
    }
  }
};

const isColValid = (grid, colIdx) => {
  let numsInCol = {};
  for (let row = 0; row < grid.length; row++) {
    for (col = 0; col < grid[row].length; col++) {
      if (colIdx === col) {
        currentNum = grid[row][col].children[0].value;

        if (currentNum && numsInCol[currentNum]) {
          return false;
        } else if (currentNum) {
          numsInCol[currentNum] = true;
        }
      }
    }
  }
  return true;
};

const isSquareValid = (rowIdx, colIdx, matrix) => {
  let xSquare = Math.floor(colIdx / 3);
  let ySquare = Math.floor(rowIdx / 3);
  let numsInSquare = {};
  for (let row = ySquare * 3; row < (ySquare + 1) * 3; row++) {
    for (let col = xSquare * 3; col < (xSquare + 1) * 3; col++) {
      let currentNum = matrix[row][col].children[0].value;

      if (currentNum && numsInSquare[currentNum]) {
        return false;
      } else if (currentNum) {
        numsInSquare[currentNum] = true;
      }
    }
  }

  return true;
};

const isCellValid = (row, col, matrix) => {
  return (
    isRowValid(grid, row) &&
    isColValid(grid, col) &&
    isSquareValid(row, col, matrix)
  );
};

const findNextEmpty = (grid, row, col) => {
  for (let currentRow = 0; currentRow < grid.length; currentRow++) {
    for (let currentCol = 0; currentCol < grid[row].length; currentCol++) {
      if (
        !grid[currentRow][currentCol].classList.contains("fixed") &&
        !grid[currentRow][currentCol].children[0].value
      ) {
        return [currentRow, currentCol];
      }
    }
  }
};

const animate = (animationList, speedInt) => {
  for (let event = 0; event < animationList.length; event++) {
    setTimeout(() => {
      let [row, col, value, className] = animationList[event];
      grid[row][col].children[0].value = value;
      grid[row][col].className = className;
    }, event * speedInt);
  }
  enableMenu(animationList.length);
};

const enableMenu = (events) => {
  setTimeout(() => {
    inProgress = false;
    document
      .querySelectorAll(`ul input[type='checkbox']`)
      .forEach((checkbox) => {
        checkbox.disabled = false;
      });
  }, events * speedInt);
};

const showAlert = (msg, className) => {
  const alert = document.createElement("div");
  alert.classList.add("alert");
  alert.classList.add(className);
  alert.appendChild(document.createTextNode(msg));
  document.querySelector("body").appendChild(alert);
  setTimeout(() => {
    document.querySelector("body").removeChild(alert);
  }, 5000);
};