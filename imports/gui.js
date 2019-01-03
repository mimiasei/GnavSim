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
        this._posX = 0;
        this._posY = 0;

        this._group = [];
        this._twoGroup = null;
        
        this.initialize();
    }

    initialize() {
        const params = { width: 600, height: 600 };
        this._two = new Two(params).appendTo(this._canvas);
        this._two.type = Two.Types.canvas;
        this._twoGroup = this._two.makeGroup();
        this._twoGroup.id = 'two_Group';
        this.circleGroup(this._game.players);
        // this.drawGroup(false, true);
        // this._two.autostart = true;
    }

    circleGroup(players) {
        const size = Math.min(this._width, this._height) / 12;
        //circle path to draw circles
        const radius = Math.min(this._height, this._width) / 2 - size / 2 - 4;
        this._posX = (this._width / 2) + size;
        this._posY = (this._height / 2) + size;
        this._twoGroup.translation.set(this._posX, this._posY);

        for (let i = 0; i < players.length; i++) {
            const angle = i * ((Math.PI * 2) / players.length);
            const x = Math.cos(angle) * radius + this._posX;
            const y = Math.sin(angle) * radius + this._posY;

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
        // this._twoGroup.remove(this._twoGroup.children);

        var thisGroup = this._two.makeGroup();

        for (let i = 0; i < this._group.length; i++) {         
            if (skipIndex !== undefined && skipIndex !== null && skipIndex !== i) {
                const circle = this.circle(this._group[i].x, this._group[i].y, this._group[i].size);
                const text = this.text(this._group[i].x, this._group[i].y, this._group[i].name);

                // let grp = this._two.makeGroup(circle, text);
                thisGroup.add(circle);
            }
        }

        thisGroup.center();

        this._two.bind('update', function(frameCount) {
            console.log(thisGroup.id + ': ' + thisGroup.rotation);
            if (thisGroup.rotation >= Math.TWO_PI - 0.0625) {
                thisGroup.rotation = 0;
            }

            thisGroup.rotation += (Math.TWO_PI - thisGroup.rotation) * 0.0625;
        });
    }

    rotateGroup() {
        var grp = this._twoGroup;

        this._two.bind('update', function(frameCount) {
            console.log(grp.id + ': ' + grp.rotation);
            if (grp.rotation >= Math.TWO_PI - 0.0625) {
                grp.rotation = 0;
            }

            grp.rotation += (Math.TWO_PI - grp.rotation) * 0.0625;
        }).play();
    }

    play() {
        this._two.play();
    }

    pause() {
        this._two.pause();
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
        console.log('updating GUI....');
        this._two.update();
    }
    
}