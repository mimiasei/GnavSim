'use strict';

import * as tools from './gnavtools.js';

export default class PlayerStack {

	constructor(players) {
        this._players = players.slice();
        this._size = players.length;
        this._pos = 0;
        this._posDealer = 0;
        this._posAdder = 0;

        this._players[0].isCurrent = true;
    }

    get players() { return this._players }

    setFirst() {
        tools.log('', null, true);
        //set first player to player after dealer
        if (this.hasNext(this._posDealer)) {
            this._pos = this._posDealer + 1;
        } else {
            this._pos = 0;
        }

        this._posAdder = 0;

        tools.log(`setting first player to ${this._players[this._pos].name}.`)
    }

    next() {
        tools.log('', null, true);
        if (this.hasNext()) {
            this._players[this._pos].isCurrent = false;
            this._pos++;
            this._posAdder = 0;
            this._players[this._pos].isCurrent = true;
            return true;
        } else {
            this._pos = 0;
            return false;
        } 
    }

    hasNext(pos) {
        tools.log('', null, true);
        pos = (pos == undefined || pos == NaN) ? this._pos : pos;

        if (pos < this._size - 1) {
            return true;
        }

        return false;
    }

    hasNextPlayer(pos) {
        pos = (pos == undefined || pos == NaN) ? this._pos : pos;
        
        return pos != this._posDealer;
    }

    current() {
        return this._players[this._pos];
    }

    nextTo(usePos) {
        tools.log('', null, true);
        
        let add = 1;
        
        if (usePos) {
            this._posAdder++
            add = this._posAdder;
        };

        if (this.hasNext(this._pos + add - 1)) {
            return this._players[this._pos + add];
        } else if (this.hasNextPlayer()) {

        } else {
            return { name: 'deck', isDeck: true };
        }
    }

    nextDealer() {
        tools.log('', null, true);
        // const oldDealer = this._players.pop(); //pop out current dealer player
        // this._players.unshift(oldDealer); //insert that player at start of array

        if (this.hasNext(this._posDealer)) {
            this._posDealer++;
        } else {
            this._posDealer = 0;
        }

        tools.log(`Dealer is now: ${this.dealer().name}`);
    }

    dealer() {
        // return this._players[this._size - 1];
        return this._players[this._posDealer];
    }

    printPlayers() {
        let pos = this._pos;

        console.log('pos: ' + pos);
        console.log('posDealer: ' + this._posDealer);

        let array = [];
        let counter = 0;
        let exit = false;
        while (!exit) {
            array.push(pos + ':' + this._players[pos].name);
            pos = this.getNextPos(pos);
            console.log('pos returned: ' + pos);
            if (!this.hasNextPlayer(pos)) {
                exit = true;
            }
            counter++;
            if (counter >= this._size) {
                exit = true;
                console.log('exiting while-loop');
            }
        }

        console.log(array);
    }

    getNextPos(pos) {
        pos = (pos == undefined || pos == NaN) ? this._pos : pos;

        if (pos < this._size - 1) {
            pos++;
            return pos;
        } else if (this.hasNextPlayer(pos)) {
            return 0;
        }
    }
}