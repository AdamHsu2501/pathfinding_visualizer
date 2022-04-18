import React, { Component } from 'react';
import './Board.css';

import { dijkstra } from '../algorithms/pathfinding/dijkstra'
import { astar } from '../algorithms/pathfinding/astar'



export default class Board extends Component {
    constructor() {
        super();
        this.state = {
            grid: [],
            isMousePressed: false,
            speed: 20,
            rows: 20,
            cols: 30,
            begin: [9, 5],
            end: [9, 25],
        }
    }

    componentDidMount() {
        this.initGrid()
    }

    createNode(row, col, isBegin, isEnd) {
        return {
            row,
            col,
            isBegin,
            isEnd,
            isWall: false,
            isVisited: false,
            isVisitable: false,
            isShortestPath: false,
        }
    }

    initGrid() {
        const { rows, cols, begin, end } = this.state
        const grid = []
        for (var r = 0; r < rows; r++) {
            const row = []
            for (var c = 0; c < cols; c++) {
                const isBegin = r === begin[0] && c === begin[1]
                const isEnd = r === end[0] && c === end[1]
                row.push(this.createNode(r, c, isBegin, isEnd))
            }
            grid.push(row)
        }

        this.setState({ grid })
    }

    async resetNodes() {
        const grid = this.state.grid.map(row => {
            return row.map(node => ({
                ...node,
                isVisited: false,
                isVisitable: false,
                isShortestPath: false,
            }))
        })
        // this.setState({ grid })

        return new Promise(resolve => this.setState({ grid }, resolve(grid)));
    }


    handleMouseDown(row, col) {
        console.log('click', row, col)
        const grid = this.state.grid
        grid[row][col].isWall = !grid[row][col].isWall
        this.setState({ grid, isMousePressed: true });
    }

    handleMouseEnter(row, col) {
        if (!this.state.isMousePressed) {
            return
        }

        this.handleMouseDown(row, col)
    }

    handleMouseUp() {
        this.setState({ isMousePressed: false })
    }


    setSpeed(speed) {
        this.setState({ speed })
    }


    handleDragStart(event, row, col) {
        let fromNode = JSON.stringify({ row, col });
        event.dataTransfer.setData("dragContent", fromNode);
    };

    handleDragOver(event) {
        event.preventDefault();
        return false;
    };

    swap(from, to) {
        const grid = this.state.grid
        const fromNode = grid[from.row][from.col]
        const toNode = grid[to.row][to.col]

        grid[from.row][from.col] = this.createNode(fromNode.row, fromNode.col, toNode.isBegin, toNode.isEnd)
        grid[to.row][to.col] = this.createNode(toNode.row, toNode.col, fromNode.isBegin, fromNode.isEnd)

        this.setState({ grid })
    };

    handleDrop(event, row, col) {
        event.preventDefault();
        let fromNode = JSON.parse(event.dataTransfer.getData("dragContent"));
        let toNode = { row, col };
        this.swap(fromNode, toNode);
        return false;
    };



    getShortestPath(node) {
        const arr = []
        let currNode = node
        while (!!currNode) {
            console.log('currNode', currNode)
            arr.unshift(currNode)
            currNode = currNode.previousNode
        }
        console.log('getShortestPath', arr)
        return arr
    }

    showShortestPath(speed, endNode) {
        const nodes = this.getShortestPath(endNode)
        for (let i = 0; i < nodes.length; i++) {
            setTimeout(() => {
                const { row, col } = nodes[i]
                const grid = this.state.grid
                grid[row][col].isShortestPath = true

                this.setState({ grid })
            }, (speed + 40) * i)
        }
    }

    showSearching(speed, visitedNodes) {
        for (let i = 0; i < visitedNodes.length; i++) {
            setTimeout(() => {
                const { row, col } = visitedNodes[i];
                const grid = this.state.grid
                grid[row][col].isVisited = true

                this.setState({ grid })

                if (i === visitedNodes.length - 1) {
                    const lastNode = visitedNodes[visitedNodes.length - 1]
                    if (lastNode.isEnd)
                        this.showShortestPath(speed, lastNode)
                }
            }, speed * i);
        }
    }

    doAlgorithm(name) {
        console.log('start algorithm', name)
        const { speed } = this.state

        this.resetNodes().then((grid) => {
            let visitedNodes;
            switch (name) {
                case 'dijkstra':
                    visitedNodes = dijkstra(grid)
                    break;
                case 'astar':
                    visitedNodes = astar(grid)
                    break;
                default:
                    visitedNodes = []
            }
            this.showSearching(speed, visitedNodes)
        })


    }


    render() {
        const { grid, speed } = this.state

return (
    <div className="container">
        < div className="margin" >
            Algorithm:
            <button onClick={() => this.doAlgorithm('dijkstra')}>
                Dijkstra
            </button>

            <button onClick={() => this.doAlgorithm('astar')}>
                A*
            </button>
        </ div >

        <div className="margin" >
            Speed:
            <button disabled={speed === 20} onClick={() => this.setSpeed(20)}>Fast</button>
            <button disabled={speed === 50} onClick={() => this.setSpeed(50)}>Slow</button>
        </div >

        <div className="margin">
            <div className="row">
                <div
                    className={`node node-begin`}
                ></div> Begin Node
            </div>
            <div className="row">
                <div
                    className={`node node-end`}
                ></div> End Node
            </div>
            <div className="row">
                <div
                    className={`node node-wall`}
                ></div> Wall Node
            </div>
        </div>

        <div className="grid">
            {grid.map(row => row.map(node => {
                const {
                    row,
                    col,
                    isBegin,
                    isEnd,
                    isWall,
                    isVisited,
                    isVisitable,
                    isShortestPath,
                } = node;
                const isDraggable = isBegin || isEnd
                const extraClass = isBegin
                    ? 'node-begin'
                    : isEnd
                        ? 'node-end'
                        : isWall
                            ? 'node-wall'
                            : isShortestPath
                                ? 'node-shortest-path'
                                : isVisited
                                    ? 'node-visited'
                                    : isVisitable
                                        ? 'node-visitable'
                                        : ''

                return (
                    <div
                        key={`${row}-${col}`}
                        className={`node ${extraClass}`}
                        onMouseDown={() => isDraggable ? '' : this.handleMouseDown(row, col)}
                        onMouseEnter={() => this.handleMouseEnter(row, col)}
                        onMouseUp={() => this.handleMouseUp()}
                        draggable={isDraggable}
                        onDragStart={(e) => isDraggable ? this.handleDragStart(e, row, col) : ''}
                        onDragOver={(e) => this.handleDragOver(e)}
                        onDrop={(e) => this.handleDrop(e, row, col)}
                    ></div>
                )
            }))}

        </div>
    </div >)
    }
}

