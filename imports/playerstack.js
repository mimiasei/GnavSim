'use strict';

export default class PlayerStack {

	constructor(players) {
        this._players = players;
        this._size = players.length;
        this._pos = 0;
    }

    next() {
        if (this.hasNext()) {
            return this._players[++this._pos];
        } else {
            this._pos = 0;
            return false;
        } 
    }

    hasNext() {
        return this._pos < this._size - 1;
    }

    current() {
        return this._players[this._pos];
    }

    nextTo() {
        if (this.hasNext()) {
            return this._players[this._pos + 1];
        } else {
            return { name: 'deck', isDeck: true };
        }
    }

    nextDealer() {
        const oldDealer = this._players.pop(); //pop out current dealer player
        this._players.unshift(oldDealer); //insert that player at start of array

        console.log(`Dealer is now: ${this.dealer().name}`);
    }

    dealer() {
        return this._players[this._size - 1];
    }
}