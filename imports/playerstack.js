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

        tools.log(`setting first player to ${this._players[this._pos].name}.`)
    }

    next() {
        tools.log('', null, true);
        if (this.hasNext()) {
            this._players[this._pos].isCurrent = false;
            this._pos++;
            this._players[this._pos].isCurrent = true;
            return true;
        } else {
            this._pos = 0;
            return false;
        } 
    }

    hasNext(pos) {
        tools.log('', null, true);
        pos = pos || this._pos;

        return pos < this._size - 1;
    }

    hasNextPlayer(pos) {
        tools.log('', null, true);
        pos = pos || this._pos;
        
        return pos !== this._posDealer;
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
}