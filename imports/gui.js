'use strict';

// import Game from './game.js';
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
        this._posX = 0;
        this._posY = 0;
        this._offsetX = 50;
        this._offsetY = 20;

        this._group = [];
        this._twoGroup = null;
        
        this.initialize();
    }

    initialize() {
        const params = { width: 800, height: 800 };

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
        this._posX = (this._width / 2) + size + this._offsetX;
        this._posY = (this._height / 2) + size + this._offsetY;
        this._twoGroup.translation.set(this._posX, this._posY);

        for (let i = 0; i < players.length; i++) {
            const angle = i * ((Math.PI * 2) / players.length);
            const x = Math.cos(angle) * radius + this._posX;
            const y = Math.sin(angle) * radius + this._posY;

            let pos = { x: 0, y: 0 };

            if (angle >= 0 && angle < (Math.PI / 4)) {
                pos = { x: 50, y: 50, i: 0 };
            } else if (angle >= (Math.PI / 4) && angle < (Math.PI / 2)) {
                pos = { x: 0, y: 50, i: 1 };
            } else if (angle >= (Math.PI / 2) && angle < (3 * Math.PI / 4)) {
                pos = { x: 0, y: 50, i: 2 };
            } else if (angle >= (3 * Math.PI / 4) && angle < Math.PI) {
                pos = { x: -50, y: 50, i: 3 };
            } else if (angle >= Math.PI && angle < (5 * Math.PI / 4)) {
                pos = { x: -50, y: -50, i: 4 };
            } else if (angle >= (5 * Math.PI / 4) && angle < (3 * Math.PI / 2)) {
                pos = { x: 0, y: -50, i: 5 };
            } else if (angle > (3 * Math.PI / 2) && angle <= (7 * Math.PI / 4)) {
                pos = { x: 0, y: -50, i: 6 };
            } else if (angle > (7 * Math.PI / 4) && angle <= (2 * Math.PI)) {
                pos = { x: 50, y: -50, i: 7 };
            }

            this._group.push({
                x: x,
                y: y,
                angle: angle,
                pos: pos,
                size: size,
                pid: players[i].pid,
                name: players[i].name,
            });
        }
    }

    findPlayer(name) {
        const index = this._group.findIndex((o) => { 
            return o.name == name; 
        });

        return {
            player: index > -1 ? this._group[index] : null,
            index: index
        };
    }

    displayCard() {
        tools.log('+++++ calling displayCard()!');
        let heldCard = this._game.currentPlayer.heldCard;
        if (heldCard) {
            heldCard = heldCard.name.replace('(', '').replace(')', '');
        } else {
            heldCard = 'no card';
        }

        this.card(this._posX, this._posY, 90);

        const styles = { 
            fill: 'black', 
            size: 17, 
            weight: 'bold',
        };

        this.text(this._posX, this._posY, heldCard, styles);

        this.update();
    }

    circle(x, y, size, blurStart, styles) {
        blurStart = blurStart || 0.8;

        styles = {
            fill: styles && styles.fill ? styles.fill : 'rgba(155, 163, 93, 1)',
        };
        
        const gradient = this._two.makeRadialGradient(
            0, 0,
            size,
            new Two.Stop(0, 'rgba(0, 0, 0, 1)', 2),
            new Two.Stop(0.75, 'rgba(0, 0, 0, 1)', 1), //blurStart
            new Two.Stop(1.0, 'rgba(0, 0, 0, 0)', 0)
        );

        let circle = this._two.makeCircle(x, y, size); //x, y, radius
        circle.fill = styles.fill; //gradient
        circle.noStroke();
        circle.opacity = 1.0;

        let circleShadow = this._two.makeCircle(x + 5, y + 5, size + 5); //x, y, radius
        circleShadow.fill = gradient;
        circleShadow.noStroke();
        circleShadow.opacity = 0.4;

        let group = this._two.makeGroup(circleShadow, circle);

        return group;
    }

    card(x, y, size) {
        let cardShadow = this._two.makeRoundedRectangle(x + 5, y + 5, size, size * 1.25, 5);
        cardShadow.fill = 'black';
        cardShadow.noStroke();
        cardShadow.opacity = 0.2;

        let card = this._two.makeRoundedRectangle(x, y, size, size * 1.25, 5);
        card.fill = '#bbbbbb';
        card.noStroke();
        card.opacity = 1.0;

        this._two.makeGroup(cardShadow, card);
    }

    speech(name, message) {
        const obj = this.findPlayer(name);

        if (obj.player) {
            this.doSpeech(obj.player, message);
        }
    }

    groupSpeech(message, skipPlayerId) {
        skipPlayerId = (skipPlayerId == undefined || skipPlayerId == NaN) ? false : skipPlayerId;

        this._group.forEach(player => {
            if (!skipPlayerId || player.pid !== skipPlayerId) {
                this.doSpeech(player, message);
            }
        });
    }

    doSpeech(player, message) {
        const offset = player.pos.y > 0 ? 10 : -10;

        let line = this._two.makeLine(
            player.x, player.y + offset, 
            player.x + player.pos.x, player.y + player.pos.y);
        line.stroke = '#ffffff';
        line.opacity = 0.75;
        line.lineWidth = 2;


        this.text(player.x + player.pos.x, player.y + player.pos.y + offset, `${player.name}: ${message}`);
    }

    // speechBox(x, y, size) {
    //     let card = this._two.makeRoundedRectangle(x, y, size * 1.5, size, 5);
    //     card.fill = '#00bfb6';
    //     card.noStroke();
    //     card.opacity = 0.75;
    //     let pointer = this._two.makePolygon(x - 40, y, x, y + 30);
    //     pointer.fill = '#00bfb6';
    //     pointer.noStroke();
    //     pointer.opacity = 0.75;
    // }

    text(x, y, message, styles) {
        styles = {
            fill: styles && styles.fill ? styles.fill : '#ffffff',
            weight: styles && styles.weight ? styles.weight : 'normal',
            opacity: styles && styles.opacity ? styles.opacity : 1.0,
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
            if (skipIndex !== i) {
                
                let styles = {};
                let sizeScale = 1;
                let circleStyle = {};

                if (this._game.currentDealer.pid == this._group[i].pid) {
                    styles = {
                        fill: '#ffff00',
                        weight: 'bold'
                    };
                }

                if (this._game.currentPlayer.pid == this._group[i].pid) {
                    styles = {
                        fill: '#ffffff',
                        weight: 'bold',
                        size: 15,
                        opacity: 1.0,
                    };

                    sizeScale = 1.4;
                    circleStyle.fill = 'rgba(115, 123, 53, 1)';
                }

                // const name = `${this._group[i].name}:(${this._group[i].pos.i}):${this._group[i].pos.x},${this._group[i].pos.y}`

                const circle = this.circle(this._group[i].x, this._group[i].y, this._group[i].size * sizeScale, 0.8, circleStyle);
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
        const obj = this.findPlayer(name);

        if (obj.player) {
            this.drawGroup(obj.index);

            const styles = {
                fill: '#ffffff',
                weight: 'bold',
                size: 15,
                opacity: 1.0,
            };

            if (this._game.currentDealer.pid == obj.player.pid) {
                styles.fill = '#ffff00';
            }

            this.circle(obj.player.x, obj.player.y, obj.player.size * 1.5, 0.97);
            this.text(obj.player.x, obj.player.y, obj.player.name, styles);
        } else {
            tools.log(`----- couldn't find player: ${name}`)
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