"use strict";

var view = {//объект вида
    displayMessage: function (msg) {//метод сообщения
        var message = document.getElementById('messageArea');
        message.innerHTML = msg;
    },
    displayHit:function (area) {//метод
        var hit = document.getElementById(area);
        hit.innerHTML = '<div class="hit"></div>';
    },
    displayMiss:function (area) {//метод промаха
        var miss = document.getElementById(area);
        miss.innerHTML = '<div class="miss"></div>';
    }
};

var model = {//объект модели
    boardSize: 7,//размер поля
    numShips: 3,//кол-во кораблей
    shipLength: 3,//длинна корабля
    shipsSunk: 0,//колличество потопленых кораблей
    ships: [//корабли представленны как массив объектов
        {location: [0,0,0], hits: ['', '', '']},//hits  необходим для того что бы пометить попадания
        {location: [0,0,0], hits: ['', '', '']},
        {location: [0,0,0], hits: ['', '', '']}
    ],


    doubleHIT: function () {
      for (var i = 0; i < this.ships.length; i++){
          for(var j = i; j < this.ships.hits.length; j++){
              if(this.ships.hits[j] == 'hit'){
                  return true
              }
          }
      }
      return false
    },//функция для проверки был ли уже совершен выстрел в данный квадрат


    fire: function (guess){//функция fire принимает аргумент - координату выстрела

        for (var i = 0; i < this.numShips; i++){//перебераем массив объектов

            // if(this.doubleHIT()){
            //     view.displayMessage('Сюда уже стреляли!!!<br>Введите другие координаты!!!');
            // }

            //var ship = this.ships[i];//получаем объект корабля
            var index = this.ships[i].location.indexOf(guess);//indexOf возвращает -1 и если index>0 == true то есть попадание
            if (index >= 0){
                view.displayHit(guess);//модифицирует html клссаом .hit
                view.displayMessage('Попадание!');//выводит сообщение о попадании
                this.ships[i].hits[index] = 'hit';//присваивает строку 'hit' в массиве где было попадание, отмечает подбитый
                if(this.isSunk(this.ships[i])){
                    view.displayMessage('Корабль потоплен!');
                    this.shipsSunk++;
                }
                return true;
            }
        }
        view.displayMiss(guess);
        view.displayMessage('Промах!');
        return false;
    },
    isSunk: function (ship) {//проверка потоплен ли корабль и возврат значения
        for (var i = 0; i < this.shipLength; i++){
            if(ship.hits[i] != 'hit'){
                return false;
            }
        }
        return true;
    },
    generateShipLocation: function () {
        var location;
        for (var i = 0; i <= this.numShips; i++){
            do{
                location = this.generateShip();
            }while (this.colision(location));
            this.ships[i].location = location;
        }
    },
    colision: function (location) {
        for(var i = 0; i < this.numShips; i++){
            var ship = model.ships[i];
            for (var j = i; j < location.length; j++){
                if(ship.location.indexOf(location[j]) >= 0){
                    return true;
                }
            }
        }
    },
    generateShip: function () {
       var direction = Math.floor(Math.random()*2);//1 вертикально, 0 горизонтально
       var row,col;
       if(direction == 1){
           //генерация начальной позиции для горизонтального корабля
           row = Math.floor(Math.random() * this.boardSize);
           col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
       }else {
           //генерация начальной позиции для горизонтального кораблся
           row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
           col = Math.floor(Math.random() * this.boardSize);
       }
       var newShipLocation = [];
       for (var i = 0; i < this.ships.length; i++){
           if(direction == 1){
               newShipLocation.push(row + '' + (col + i));
           }else {
               newShipLocation.push((row + i) + '' + col);
           }
       }
       return newShipLocation;
    }

};

var controller = {

    guesses: 0,//подсчет количества выстрелов

    processGuesses: function (guess) {
        var location = this.parseGuess(guess);
        if(location){
            this.guesses++;
            var hit = model.fire(location);
            if(hit && model.shipsSunk == model.numShips){
                view.displayMessage('Все корабли потоплены!!!, всего выстрелов: '+ this.guesses);
            }
        }
    },
    parseGuess: function (guess) {//метод возвращающий из буквенного значения численное(место выстрела)
        var alphabet = ['A','B','C','D','E','F','G'];//массив индексы которого будут первыми значениями при выстреле
        if(guess == null || guess.length != 2){//проверка значения,  длина не больше 2х и не null
            view.displayMessage('Введено не корректное значение!');
        }else {
            var firstChar = guess.charAt(0).toUpperCase();//первое значение аппаем
            var row = alphabet.indexOf(firstChar);//берем индекс элемена  массива
            var column = guess.charAt(1);
            if(isNaN(row) || isNaN(+column)){// добавил + так как выдавало предупреждение о некоректном типе данных
                view.displayMessage('Введенное значение не является числом!!!');
            }else if(row < 0 || column < 0 || model.boardSize < row || model.boardSize < column){//проверка значения в диапахоне ли оно
                view.displayMessage('Введенное значение находится вне игрового поля');
            }else {
                return row + column;// возвращение пропарсеного значения
            }
        }
        return null;
    },
};
function init() {
    var fireButton = document.getElementById('fireButton');
    fireButton.onclick = handleFireButton;
    var  guessInput = document.getElementById('valueInput');
    guessInput.onkeypress = handleKeyPress;

    model.generateShipLocation();
}
function handleKeyPress(e) {
    var fireButton = document.getElementById('fireButton');
    if (e.keyCode == 13){//13 соответствует нажатию enter
        fireButton.click();
        return false;//ничего не должна возвращать
    }
}
function handleFireButton() {
    var guessInput = document.getElementById('valueInput');
    var guess = guessInput.value;
    controller.processGuesses(guess);
    guessInput.value = "";
}
window.onload = init;