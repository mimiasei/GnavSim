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
        circle.opacity = 0.5;
    }

    circleGroup(n) {
        const size = Math.min(this._width, this._height) / 8;

        for(var i = 0; i < n; i++){
            var angle = i * ((Math.PI * 2) / n); //
            var x = Math.cos(angle) * radius + circleX;
            var y = Math.sin(angle) * radius + circleY;
            circle(x, y, size);
        }
    }

    update() {
        this._two.update();
    }
    
}