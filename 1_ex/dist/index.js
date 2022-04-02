const initState = {
    field_size:3,
    currentPalyer:1
}

const gameState = { 
    field_size: initState.field_size,
    move_count: 0,
    game_over:false,
    model_field:[],
    winner:0,
    currentPalyer:initState.currentPalyer,
    buffer: [],
    winner_seq:[]
};

const classes = {
    game_field: 'game-field',
    field_cell: 'game-field_cell',
    btn_block: 'btns_block',
    btn:'button',
    gamer: 'gamer'
};

const interfaceElements = {
    field:document.getElementsByClassName(classes.game_field)[0],
    notificator: document.getElementsByClassName(classes.gamer)[0],
    buttons_block: document.getElementsByClassName(classes.btn_block)[0]
}

const btns = [{value:'Reset', action: resetGame}, 
            {value:'Extend', action: extendField }, 
            {value:'Compress', action: compressField},
            {value: 'Undo', action: undo}
        ];

const figures ={ 
    circle: document.querySelector('#circle').outerHTML,
    cross: document.querySelector('#cross').outerHTML
};

////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded',() => {
    resetGame();
});

function resetGame(){
    gameState.game_over=initState.game_over;
    gameState.move_count=0;
    gameState.winner = 0;
    initField();
    initBtns();
    defineHeaderText()
}

function initBtns() {
    interfaceElements.buttons_block.innerHTML = '';
    btns.forEach(btn => initBtn(btn,interfaceElements.buttons_block))
}

function initBtn(btnInfo, parent){
    const btn = document.createElement('input');
    const {value, action} = btnInfo;
    btn.setAttribute('type', 'button');
    btn.setAttribute('value',value);
    btn.addEventListener('click', action);
    parent.appendChild(btn);
}

function initField(){
    const {field_size, model_field} = gameState,
            {field} = interfaceElements;
    field.innerHTML='';
    field.style.gridTemplateColumns = `repeat(${field_size}, auto)`
    for(let i = 0; i != field_size; i++){
        model_field[i] = [];
        for(let j =0; j != field_size; j++) {
            const cell = initCell(i,j);
            field.appendChild(cell);
            model_field[i][j] =  cell;
        };
    };
}

function initCell(row,column){
    const cell = document.createElement('div');
    cell.classList.add(classes.field_cell);
    cell.setAttribute('row', row );
    cell.setAttribute('column', column);
    cell.addEventListener('click', doMove);
    return cell;
}

function defineHeaderText() {
    const {notificator} = interfaceElements,
        {move_count, winner, game_over} = gameState;
    if(!game_over){
        if(winner === 0){
            notificator.innerHTML=`Ход игрока ${move_count % 2 + 1}`;
            return;
        }
    }
    if(winner !== 0){
        notificator.innerHTML=`Победа игрока ${winner}`;
    }
    else{
        notificator.innerHTML=`Ничья`;
    }
}

///////////////////////////////////////////
function extendField()  {
    gameState.field_size++;
    resetGame();
}

function compressField() {
    if(gameState.field_size > initState.field_size){
        gameState.field_size--;
        resetGame();
    }
}

function doMove(e) {
    if(!gameState.game_over && e.target.className == classes.field_cell){
        const {target} = e,
            {model_field} = gameState,
            [row, column] = [+target.getAttribute('row'), +target.getAttribute('column')];

        if(model_field[row][column].innerHTML == ''){
            const playerFlag = gameState.move_count%2 === 0 ,
                figure_name = playerFlag? 'cross' : 'circle',
            figure = figures[figure_name]
            const [row, column] = [+target.getAttribute('row'), +target.getAttribute('column')];
            model_field[row][column].innerHTML = figure;
            gameState.move_count++;
            gameState.currentPalyer = playerFlag ? 1: 2
            gameState.buffer.push(model_field[row][column]);

            defineWinner(figure,row,column);
        }
    }
}

function defineWinner(figure,row,column){
    const {model_field, field_size, currentPalyer, move_count, winner_seq } = gameState;
    let [byCol, byRow, byMainDia, byMirDia] =[[],[],[],[]];
    
    for(let i =0; i != field_size; i++){
        model_field[i][i].style.backgroundColor
        if(model_field[i][i].innerHTML === figure){
            byMainDia.push(model_field[i][i]);
        }
        
        if(model_field[field_size - i - 1][i].innerHTML === figure){
            byMirDia.push(model_field[field_size - i - 1][i]);
        }
        if(model_field[row][i].innerHTML === figure){
            byRow.push(model_field[row][i]);
        }
        if(model_field[i][column].innerHTML === figure){
            byCol.push(model_field[i][column]);
        }
    }

    const winOptions = [byCol, byRow, byMainDia, byMirDia],
        option = winOptions.find(opt => opt.length === field_size);
    
    if(option){
        gameState.winner = currentPalyer;
        gameState.game_over = true;
        option.forEach(cell => colorize(cell))
        gameState.winner = currentPalyer;
        disableButtons();
    }
    if(move_count === field_size*field_size){
        gameState.game_over = true;
        disableButtons();
    }
    defineHeaderText();
}

function disableButtons(){
    [...interfaceElements.buttons_block.childNodes].filter(btn => btn.value != 'Reset').forEach(btn => btn.disabled = true );
}

function undo(){
    if(gameState.buffer.length > 0){
        gameState.buffer.pop().innerHTML = ''
        gameState.move_count--;
        defineHeaderText()
    }
}

function colorize(cell){
    cell.style.backgroundColor ='red'
}