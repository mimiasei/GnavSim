'use strict';

// import Game from './game.js';
// import * as tools from './gnavtools.js';

export default class Gui {

	constructor(game, width, height) {
        width = width || 400;
        height = height || 400;

        this._canvas = document.getElementById('gameCanvas');
        this._game = game || null;
        this._two = null;
        this._width = width;
        this._height = height;

        this._group = [];
        
        this.initialize();
    }

    initialize() {
        const params = { width: 600, height: 600 };
        this._two = new Two(params).appendTo(this._canvas);
        this.circleGroup(this._game.players);
        // this._two.autostart = true;
    }

    circleGroup(players) {
        const size = Math.min(this._width, this._height) / 12;
        //circle path to draw circles
        const radius = Math.min(this._height, this._width) / 2 - size / 2 - 4;
        const circleX = (this._width / 2) + size;
        const circleY = (this._height / 2) + size;

        for (let i = 0; i < players.length; i++) {
            const angle = i * ((Math.PI * 2) / players.length);
            const x = Math.cos(angle) * radius + circleX;
            const y = Math.sin(angle) * radius + circleY;

            this._group.push({
                x: x,
                y: y,
                size: size,
                name: players[i].name,
            });
        }
    }

    circle(x, y, size) {
        let circle = this._two.makeCircle(x, y, size); //x, y, radius
        circle.fill = '#ffffff';
        circle.noStroke();
        circle.opacity = 0.25;
    }

    text(x, y, message, styles) {
        styles = styles || {
            fill: '#ffffff',
            weight: 'normal',
            opacity: 0.5,
        };

        this._two.makeText(message, x, y, styles);
    }

    drawGroup(skipIndex) {
        this._two.clear();

        for (let i = 0; i < this._group.length; i++) {         
            if (skipIndex !== undefined && skipIndex !== null && skipIndex !== i) {
                this.circle(this._group[i].x, this._group[i].y, this._group[i].size);
                this.text(this._group[i].x, this._group[i].y, this._group[i].name);
            }
        }
    }

    selectPlayer(name) {
        const i = this._group.findIndex((o) => { return o.name == name; });
        if (i > -1) {
            const styles = {
                fill: '#ffffff',
                weight: 'bold',
                opacity: 1.0,
            };

            //reset all other players
            this.drawGroup(i);
            this.circle(this._group[i].x, this._group[i].y, this._group[i].size * 1.25);
            this.text(this._group[i].x, this._group[i].y, this._group[i].name, styles);
        }
    }

    update() {
        this._two.update();
    }
    
}