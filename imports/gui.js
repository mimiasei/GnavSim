'use strict';

import Game from './game.js';
import * as tools from './gnavtools.js';

export default class Gui {

	constructor(game, width, height) {
        width = width || 400;
        height = height || 400;

        this._canvas = document.getElementById('gameCanvas');
        this._game = game || null;
        this._two = null;
        this._width = width;
        this._height = height;
        
        this.initialize();
    }

    initialize() {
        const params = { width: 500, height: 500 };
        this._two = new Two(params).appendTo(this._canvas);
    }

    circle(x, y, size) {
        let circle = this._two.makeCircle(x, y, size); //x, y, radius
        circle.fill = '#ffffff';
        circle.noStroke();
        circle.opacity = 0.25;
    }

    text(x, y, message) {
        let text = new Two.Text(message, x, y);
        // text.noStroke();
        text.fill = '#ffffff';
        // text.noFill();
    }

    circleGroup(players) {
        const size = Math.min(this._width, this._height) / 12;
        //circle path to draw circles
        const radius = Math.min(this._height, this._width) / 2 - size / 2 - 4;
        const circleX = (this._width / 2) + size;
        const circleY = (this._height / 2) + size;

        for(var i = 0; i < players.length; i++){
            var angle = i * ((Math.PI * 2) / players.length);
            var x = Math.cos(angle) * radius + circleX;
            var y = Math.sin(angle) * radius + circleY;
            this.circle(x, y, size);
            this.text(x, y, players[i].name);
        }
    }

    update() {
        this._two.update();
    }
    
}