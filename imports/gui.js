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
        this.circleGroup(this._game.playerStack.players);
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
                pid: players[i].pid,
                name: players[i].name,
            });
        }
    }

    displayCard() {
        let heldCard = this._game.currentPlayer.heldCard;
        if (heldCard) {
            heldCard = heldCard.name.replace('(', '').replace(')', '');
        } else {
            heldCard = 'no card';
        }

        this.card(this._posX, this._posY, 90);

        const styles = { 
            fill: '#000', 
            size: 15, 
            weight: 'bold',
        };

        this.text(this._posX, this._posY, heldCard, styles);
    }

    circle(x, y, size, blurStart) {
        blurStart = blurStart || 0.8;

        const gradient = this._two.makeRadialGradient(
            0, 0,
            size,
            new Two.Stop(0, 'rgba(255, 255, 255, 1)', 2),
            new Two.Stop(blurStart, 'rgba(255, 255, 255, 1)', 1),
            new Two.Stop(1.0, 'rgba(255, 255, 255, 0)', 0)
        );

        let circle = this._two.makeCircle(x, y, size); //x, y, radius
        circle.fill = gradient;
        circle.noStroke();
        circle.opacity = 0.25;

        return circle;
    }

    card(x, y, size) {
        let card = this._two.makeRoundedRectangle(x, y, size, size * 1.25, 5);
        card.fill = '#ffffff';
        card.noStroke();
        card.opacity = 0.75;
    }

    text(x, y, message, styles) {
        styles = {
            fill: styles && styles.fill ? styles.fill : '#ffffff',
            weight: styles && styles.weight ? styles.weight : 'normal',
            opacity: styles && styles.opacity ? styles.opacity : 0.5,
            size: styles && styles.size ? styles.size : 13,
        };

        return this._two.makeText(message, x, y, styles);
    }

    drawGroup(skipIndex) {
        this._two.clear();

        var thisGroup = this._two.makeGroup();
        thisGroup.translation.set(this._posX, this._posY);
        // thisGroup.rotation = thisGroup.scale = 0.0;

        for (let i = 0; i < this._group.length; i++) {         
            if (skipIndex !== undefined && skipIndex !== null && skipIndex !== i) {
                
                let styles = {};
                if (this._game.currentDealer.pid == this._group[i].pid) {
                    styles = {
                        fill: '#ffff00',
                        weight: 'bold'
                    };
                }

                const circle = this.circle(this._group[i].x, this._group[i].y, this._group[i].size);
                const text = this.text(this._group[i].x, this._group[i].y, this._group[i].name, styles);

                let grp = this._two.makeGroup(circle, text);
                thisGroup.add(grp);
            }
        }

        thisGroup.center();

        // this._two.bind('update', function(frameCount) {
        //     if (thisGroup.scale > 0.9999) {
        //         thisGroup.scale = thisGroup.rotation = 0;
        //         this.pause();
        //     }
        //     const t = (1 - thisGroup.scale) * 0.125;
        //     thisGroup.scale += t;
        //     thisGroup.rotation += t * 4 * Math.PI;
        // });
    }

    selectPlayer(name) {
        const i = this._group.findIndex((o) => { return o.name == name; });
        if (i > -1) {
            const styles = {
                fill: '#ffffff',
                weight: 'bold',
                size: 15,
                opacity: 1.0,
            };

            //reset all other players
            this.drawGroup(i);
            this.circle(this._group[i].x, this._group[i].y, this._group[i].size * 1.5, 0.97);
            this.text(this._group[i].x, this._group[i].y, this._group[i].name, styles);
        }
    }

    update() {
        this._two.update();
    }

    play() {
        this._two.play();
    }

    pause() {
        this._two.pause();
    }
    
}