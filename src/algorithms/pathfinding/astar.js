function convertGrid(grid) {
  const arr = [];
  for (let row of grid) {
    const currRow = [];
    for (let node of row) {
      currRow.push({
        ...node,
        gCost: Infinity, // distance from begin node
        // hCost: Infinity, // distance from end node
        fCost: Infinity, // gCost + hCost
      });
    }
    arr.push(currRow);
  }
  return arr;
}

function getBegin(grid) {
  let begin;
  grid.forEach((row) => {
    row.forEach((node) => {
      if (node.isBegin) {
        begin = node;
      }
    });
  });
  return begin;
}

function getEnd(grid) {
  let end;
  grid.forEach((row) => {
    row.forEach((node) => {
      if (node.isEnd) {
        end = node;
      }
    });
  });
  return end;
}

function getDistance(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function astar(data) {
  const grid = convertGrid(data);
  const end = getEnd(grid);
  const begin = getBegin(grid);
  begin.gCost = 0;
  begin.fCost = getDistance(begin, end);

  let visited = [];
  let visitable = [begin];

  while (!!visitable.length) {
    const currNode = visitable
      .sort((a, b) => {
        if (a.fCost !== b.fCost) {
          return a.fCost - b.fCost;
        } else {
          return a.gCost - b.gCost;
        }
      })
      .shift();

    const { isWall, row, col, isEnd } = currNode;

    if (isWall) continue;

    currNode.isVisited = true;
    visited.push(currNode);
    if (isEnd) {
      return visited;
    }

    const neighbors = [];
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

    neighbors
      .filter((neighbor) => !neighbor.isVisited && !neighbor.isWall)
      .forEach((neighbor) => {
        const gCost = currNode.gCost + 1;

        if (neighbor.gCost > gCost) {
          neighbor.gCost = gCost;
          neighbor.fCost = gCost + getDistance(neighbor, end);
          neighbor.previousNode = currNode;
        }

        if (!neighbor.isVisitable) {
          neighbor.isVisitable = true;
          visitable.push(neighbor);
        }
      });
  }

  return visited;
}
