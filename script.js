// TASK FOR NEXT TIME
// complete apple handeling, and add dataset.grid to apple and handle it
// and handle dataset.grid of snakeBody parts
// Logic for apple eating and snakeBody grow

// Global Variables and QuerySelectors
const alerts = document.querySelector("#alerts");
alerts.style.display = 'none';
const startBtn = document.querySelector("#startBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const levelSelector = document.querySelector("#level");
const scoreSelector = document.querySelector("#score");
const timeSelector = document.querySelector("#time");
const gameBoard = document.querySelector("#gameBoard");
const alertsTexts = document.querySelector(".alerts-texts");
let currLevel = 1;
let currScore = 0;
let currLvlScore = 0;
let direction = 'right';
let currTickSepeed = 130;//ms // Max: 130, min: 50
let nCols;
let nRows;
let gameRunning = false;
let gameTickClock;
const apple = createApple();
const levelScoreMap = [0,5,10,10,10,15,15,15,20,20,20];
const levelTickSpeedMap = [130,130,125,120,115,100,90,80,70,60,50];

// snake
const snakeHead = createSnakeHead();
let snakeBody = [];


// Thoughts
/*
    Total 10 Levels:
    Current     
    Level       ScoreToPass
    1           +5
    2           +10
    3           +10
    4           +10
    5           +15
    6           +15
    7           +15
    8           +20
    9           +20
    10          +20

i have two ideas for New Level
    1. The Tick Speed decreases and the size of Snake remains the same so i have to expand the no of cells also in the gameBoard
    2. The tick Speed decreases and teh size of Sname Resets now i dont need to increase the no. of cells in the gameBoard
    SO lets Go with 2 initially later we will give options Hard or Easy curently default Easy only

i will store the values of tick speed , level and the time in localStorage whenever Pause is Pressed




*/

// CODE

// HELPERS

function debounceResize(fn, delay) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

class Alerts{
    showAlert(msg){
        const span = document.createElement('span');
        span.textContent = msg;
        alertsTexts.appendChild(span);
        alerts.style.display = 'flex';
    }
    hideAndClearAlert(){
        alertsTexts.textContent = '';
        alerts.style.display = 'none';
    }
    generateAlert(msg,delay) {
        let timeoutId = null;

        return (...args) => {
            if (timeoutId === null) {
                this.showAlert(msg);
            } else {
                clearTimeout(timeoutId);
                this.showAlert(msg);
            }

            timeoutId = setTimeout(() => {
                this.hideAndClearAlert();
                timeoutId = null;
            }, delay);
        };
    }
}

const AlertObj = new Alerts();

    
// Create the Grids on Game Board and Name them
function createGameBoardGrids(triger){
    if(typeof(triger) === 'object'){
        (AlertObj.generateAlert('Resized the Window! Reseting Level!', 3000))();
    }

    gameBoard.style.gridTemplateColumns = `repeat(${Math.floor(gameBoard.clientWidth/20)},1fr)`;
    nCols = Math.floor(gameBoard.clientWidth/20);
    gameBoard.style.gridTemplateRows = `repeat(${Math.floor(gameBoard.clientHeight/20)},1fr)`;
    nRows = Math.floor(gameBoard.clientHeight/20);
    
    loadLevel();

}

createGameBoardGrids();


// Load Level
function loadLevel(){
    let grid = `${nRows/2}/${nCols/2}/${(nRows/2)+1}/${(nCols/2)+1}`;
    direction = 'right';
    snakeBody = [];
    currLvlScore = 0;
    resetScoreTocurrentLvl();
    // loading Snake again
    gameBoard.textContent = ''; //clear the entire gameBoard
    snakeHead.style.gridArea = grid;
    snakeHead.dataset.grid = grid;
    let snakeBodyPart = createSnakeBody();
    snakeBodyPart.style.gridArea = `${nRows/2}/${(nCols/2)-1}/${(nRows/2)+1}/${(nCols/2)}`;
    snakeBody.push(snakeBodyPart);
    snakeHead.style.transform = 'rotate(0deg)';
    gameBoard.appendChild(snakeHead);
    snakeBody.forEach( ele => gameBoard.appendChild(ele));
    
    appendApple();
}

function islevelCompleted(){
    if(currLvlScore >= levelScoreMap[currLevel]) return true;
    return false;
}

function levelCompleted(){
    gamePause();
    currLevel++;
    levelSelector.textContent = currLevel;
    currTickSepeed = levelTickSpeedMap[currLevel];
    loadLevel();
}
// Snake Creation
function createSnakeHead(grid){
    let div = document.createElement('div');
    div.classList.add('snake');
    div.classList.add('snake-head');
    div.dataset.grid = grid!=undefined? grid : '';
    return div;
}
function createSnakeBody(){
    let div = document.createElement('div');
    div.classList.add('snake');
    div.classList.add('snake-body');
    div.dataset.grid = '';
    return div;
}

// HANDELING SNAKE DIRECTION
function changeDirection(event){
    if(!gameRunning) return;
    const key = event.key;
    const keyMapDirection = {ArrowRight : 'right', ArrowLeft: 'left', ArrowUp: 'up', ArrowDown: 'down'};
    if(keyMapDirection[key] == direction) return;
    if((key == 'ArrowRight' || key == 'd') && direction != 'left') direction = keyMapDirection.ArrowRight;
    else if((key == 'ArrowLeft' || key == 'a') && direction != 'right') direction = keyMapDirection.ArrowLeft;
    else if((key == 'ArrowUp' || key == 'w') && direction != 'down') direction = keyMapDirection.ArrowUp;
    else if((key == 'ArrowDown' || key == 's') && direction != 'up') direction = keyMapDirection.ArrowDown;
}

// MOVE SNAKE
function moveSnake(){
    const arr = (snakeHead.style.gridArea).split('/');
    let gridAreaValues = {rowSt: Number((arr[0])), colSt: Number((arr[1])), rowEnd: Number((arr[2])), colEnd: Number((arr[3]))};
    let nextGrid;
    if(direction === 'right'){
        gridAreaValues.colSt += 1;
        gridAreaValues.colEnd +=1;
        snakeHead.style.transform = 'rotate(0deg)';
    }
    else if(direction === 'left'){
        gridAreaValues.colSt -= 1;
        gridAreaValues.colEnd -=1;
        snakeHead.style.transform = 'rotate(180deg)';
    }
    else if(direction === 'up'){
        gridAreaValues.rowSt -= 1;
        gridAreaValues.rowEnd -=1;
        snakeHead.style.transform = 'rotate(270deg)';   
    }
    else{
        gridAreaValues.rowSt += 1;
        gridAreaValues.rowEnd +=1;
        snakeHead.style.transform = 'rotate(90deg)';   
    }

    nextGrid = `${gridAreaValues.rowSt}/${gridAreaValues.colSt}/${gridAreaValues.rowEnd}/${gridAreaValues.colEnd}`;

// now we have snakes head next position nextGrid:
// 1. there is an wall here (GAME OVER)
// 2. there is an body part here(GAME OVER)
// 3. there is an apple here (CHECK IF LEVEL COMPLETED -> MOVE APPLE -> ADD AN SNAKEBODY AT CURRENT HEAD -> MOVE SNAKE)
// 4. there is nothing here (STORE THE CURRENT HEAD LOCATION(HEADGRID) -> MOVE THE HEAD -> MOVE THE TAIL BODY TO (HEADGRID) )

// 1,2
    if(gridAreaValues.colSt === nCols+1 || gridAreaValues.colSt === -1 || gridAreaValues.rowSt === nRows+1 || gridAreaValues.rowSt === -1 || isgoingToHitbody(nextGrid)){
        gameOver();
        return;
    }
// 3
    const currSnakeHeadGrid = snakeHead.dataset.grid;
    if(nextGrid === apple.dataset.grid){
        incScore();
        if(islevelCompleted()){
            levelCompleted();
            return;
        }
        moveApple();
        snakeHead.style.gridArea = nextGrid;
        snakeHead.dataset.grid = nextGrid;
        let newBodyPart = createSnakeBody();
        newBodyPart.style.gridArea = currSnakeHeadGrid;
        newBodyPart.dataset.grid = currSnakeHeadGrid;
        snakeBody.unshift(newBodyPart);
        gameBoard.appendChild(newBodyPart);
        return;
    }
// 4 
    snakeHead.style.gridArea = nextGrid;
    snakeHead.dataset.grid = nextGrid;
    snakeBody.unshift(snakeBody.pop());
    snakeBody[0].dataset.grid = currSnakeHeadGrid;
    snakeBody[0].style.gridArea = currSnakeHeadGrid;
}
// SCORE HANDELER
function incScore(){
    currLvlScore++;
    currScore++;
    scoreSelector.textContent = currScore;
}
function resetScoreTocurrentLvl(){
    currScore = currScore - currLvlScore;
    scoreSelector.textContent = currScore;
}

// APPLE HANDELING
function createApple(){
    let div = document.createElement('div');
    div.className = 'apple';
    return div;
}
function appendApple(){// called at each level reset
    let rowSt = Math.floor((Math.random()*nRows)+1);
    let colSt = Math.floor((Math.random()*nCols)+1);
    while(!isGridEmpty(`${rowSt}/${colSt}/${rowSt+1}/${colSt+1}`)){
        rowSt = Math.floor((Math.random()*nRows)+1);
        colSt = Math.floor((Math.random()*nCols)+1);
    }
    apple.style.gridArea = `${rowSt}/${colSt}/${rowSt+1}/${colSt+1}`;
    apple.dataset.grid = `${rowSt}/${colSt}/${rowSt+1}/${colSt+1}`;
    gameBoard.appendChild(apple);
}
function moveApple(){// called when the snake eats an apple in a level
    let rowSt = Math.floor((Math.random()*nRows)+1);
    let colSt = Math.floor((Math.random()*nCols)+1);
    while(!isGridEmpty(`${rowSt}/${colSt}/${rowSt+1}/${colSt+1}`)){
        rowSt = Math.floor((Math.random()*nRows)+1);
        colSt = Math.floor((Math.random()*nCols)+1);
    }
    apple.style.gridArea = `${rowSt}/${colSt}/${rowSt+1}/${colSt+1}`;
    apple.dataset.grid = `${rowSt}/${colSt}/${rowSt+1}/${colSt+1}`;
}

// IS GRID EMPTY (check dataset of snakehead, ALL snakebody) if at grid we get is empty return true
function isGridEmpty(grid){
    // check old apple location
    if(apple.dataset.grid === grid) return false;

    // snakeHead
    if(snakeHead.dataset.grid === grid) return false;

    // snakeBody
    if(snakeBody.some(ele => ele.dataset.grid === grid)) return false;

    return true;
}

function isgoingToHitbody(grid){
    // snakeBody
    if(snakeBody.some(ele => ele.dataset.grid === grid)) return true;

    return false;
}

// GAME TICK CLOCK
function gameTick(){
    moveSnake();
}
function gameStart(){
    if(gameRunning) return;
    gameRunning = true;
    gameTickClock = setInterval(gameTick, currTickSepeed);
}
function gamePause(){
    if(gameTickClock === undefined) return;
    gameRunning = false;
    clearInterval(gameTickClock);
}
function gameOver(){
    (AlertObj.generateAlert('Game Over!!!!', 3000))();
    gamePause();
    resetScoreTocurrentLvl();
    loadLevel();
}

// EVENT LISTENERS
window.addEventListener("resize", debounceResize(createGameBoardGrids, 300));
document.querySelector('body').addEventListener('keydown', changeDirection);
startBtn.addEventListener('click',gameStart);
pauseBtn.addEventListener('click',gamePause);