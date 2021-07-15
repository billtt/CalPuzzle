
const ROWS = 9;
const COLS = 6;
const board = [[]];
const pieces = [];

const rotate = m => m[0].map((val, index) => m.map(row => row[index]).reverse());
const transpose =  m => m[0].map((x,i) => m.map(x => x[i]));

let count = 0;
let solutions = 0;

class Piece {
    // shape0 is a 2d-array of 0/1 describing one orientation of the piece
    constructor(id, shape0) {
        this.initShapes(shape0);
        this.id = id;
        this.shapeId = 0;
        this.row = -1;
        this.col = -1;
        this.onboard = false;
    }

    initShapes(shape0) {
        this.shapes = [];
        let shape = shape0;
        for (let i=0; i<2; i++) {
            for (let j=0; j<4; j++) {
                this.shapes.push(shape);
                shape = rotate(shape);
            }
            shape = transpose(shape);
        }
    }

    currentShape() {
        return this.shapes[this.shapeId];
    }

    tryPutOnBoard(row, col) {
        // shift left to occupy the position
        let shape = this.currentShape();
        for (let i=0; i<shape[0].length; i++) {
            if (shape[0][i]) {
                col -= i;
                break;
            }
        }
        this.row = row;
        this.col = col;
        let width = shape[0].length;
        let height = shape.length;
        // check if overflow
        if (this.row < 0 || this.col < 0 || this.row + height > ROWS || this.col + width > COLS) {
            return false;
        }

        // check if occupied by other pieces
        for (let i=this.row; i<this.row+height; i++) {
            for (let j=this.col; j<this.col+width; j++) {
                if (board[i][j] && shape[i-this.row][j-this.col]) {
                    return false;
                }
            }
        }

        // put the piece
        for (let i=this.row; i<this.row+height; i++) {
            for (let j=this.col; j<this.col+width; j++) {
                if (shape[i-this.row][j-this.col]) {
                    board[i][j] = this;
                }
            }
        }
        this.onboard = true;
        return true;
    }

    removeFromBoard() {
        if (!this.onboard) {
            return;
        }

        let shape = this.currentShape();
        let width = shape[0].length;
        let height = shape.length;
        for (let i=this.row; i<this.row+height; i++) {
            for (let j=this.col; j<this.col+width; j++) {
                if (shape[i-this.row][j-this.col]) {
                    board[i][j] = null;
                }
            }
        }

        this.onboard = false;
    }
}

function init() {
    for (let i=0; i<ROWS; i++) {
        board[i] = [];
        for (let j=0; j<COLS; j++) {
            board[i][j] = null;
        }
    }

    pieces.push(new Piece(1, [
        [1,1,1],
        [1,1,0]
    ]), new Piece(2, [
        [1,1,1,1],
        [0,1,0,0],
        [0,1,0,0]
    ]), new Piece(3, [
        [1,1,1,1,1],
        [0,1,0,0,0]
    ]), new Piece(4, [
        [0,1,1,1],
        [1,1,0,0]
    ]), new Piece(5, [
        [1,0,0,0],
        [1,0,0,0],
        [1,1,1,1]
    ]), new Piece(6, [
        [1,0,0,0,0],
        [1,1,1,1,1]
    ]), new Piece(7, [
        [0,0,1,1],
        [1,1,1,0],
        [0,0,1,0]
    ]), new Piece(8, [
        [1,1,1],
        [0,1,0],
        [0,1,1]
    ]), new Piece(9, [
        [1,0,0,0],
        [1,1,1,1]
    ]));
}

function print() {
    console.log('');
    const bg = [0, 103, 41, 42, 43, 44, 45, 46, 47, 107];
    for (let i=0; i<ROWS; i++) {
        let line = '';
        for (let j=0; j<COLS; j++) {
            let cell = board[i][j];
            if (cell == null) { // should not happen
                line += '! ';
            } else if (cell.id === ' ') {
                line += '  ';
            } else {
                line += '\x1b[' + bg[cell.id] + 'm' + cell.id + ' \x1b[49m';
            }
        }
        console.log(line);
    }
}

function solve(pos) {
    if (pos >= ROWS * COLS) {
        solutions++;
        print();
        return true;
    }
    let row = Math.floor(pos / COLS);
    let col = pos % COLS;

    // if occupied, look for next slot
    if (board[row][col]) {
        return solve(pos + 1);
    }

    // find one unused piece that will fit
    for (let i=0; i<pieces.length; i++) {
        let piece = pieces[i];
        if (piece.onboard) {
            continue;
        }
        for (piece.shapeId = 0; piece.shapeId<8; piece.shapeId++) {
            count++;
            if (piece.tryPutOnBoard(row, col)) {
                solve(pos+1);
                piece.removeFromBoard();
            }
        }
    }
    return false;
}

function input() {
    let arg = '';
    if (process.argv.length >= 3) {
        arg = process.argv[2];
    }
    let millis = Date.parse(arg);
    if (isNaN(millis)) {
        console.log(`Invalid input! Usage:\nnode CalPuzzle.js YYYY/MM/DD`);
        process.exit();
    }
    let date = new Date(millis);
    let mon = date.getMonth();
    let dow = date.getDay();
    let dom = date.getDate();
    const barrier = new Piece(' ', [[1]]);

    // month
    let row = Math.floor(mon / COLS);
    let col = mon % COLS;
    board[row][col] = barrier;

    // day of month
    dom--;
    row = Math.floor(dom / COLS) + 2;
    col = dom % COLS;
    board[row][col] = barrier;

    // day of week
    dow--;
    if (dow < 0) { // Sunday
        dow = 6;
    }
    if (dow > 2) { // break after Wednesday
        dow += 2;
    }
    dow += 3;
    row = Math.floor(dow / COLS) + 7;
    col = dow % COLS;
    board[row][col] = barrier;
}

function main() {
    init();
    input();
    solve(0);
    console.log(`Total tries: ${count}, solutions: ${solutions}.`);
}

main();
