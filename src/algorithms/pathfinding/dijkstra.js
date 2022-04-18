function convertGrid(grid) {
  const arr = [];
  for (let row of grid) {
    const currRow = [];
    for (let node of row) {
      currRow.push({
        ...node,
        distance: Infinity,
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
        node.distance = 0;
        begin = node;
      }
    });
  });
  return begin;
}

export function dijkstra(data) {
  const grid = convertGrid(data);
  const begin = getBegin(grid);
  const visited = [];
  const visitable = [begin];

  while (!!visitable.length) {
    const currNode = visitable.sort((a, b) => a.distance - b.distance).shift();

    const { isWall, distance, isEnd, row, col } = currNode;

    if (isWall) continue;

    if (distance === Infinity) return visited;

    currNode.isVisited = true;
    visited.push(currNode);

    if (isEnd) return visited;

    const neighbors = [];
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

    neighbors
      .filter((node) => !node.isVisited && !node.isVisitable)
      .forEach((node) => {
        node.distance = currNode.distance + 1;
        node.previousNode = currNode;
        node.isVisitable = true;
        visitable.push(node);
      });
  }

  return visited;
}
