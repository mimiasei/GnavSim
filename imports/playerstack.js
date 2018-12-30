'use strict';

export default class PlayerStack {

	constructor(players) {
        this._players = players;
        this._size = players.length;
        this._pos = 0;
        this._posAdder = 0;

        this._players[0].isCurrent = true;
    }

    next() {
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
        pos = pos || this._pos;

        return pos < this._size - 1;
    }

    current() {
        return this._players[this._pos];
    }

    nextTo(usePos) {
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
        const oldDealer = this._players.pop(); //pop out current dealer player
        this._players.unshift(oldDealer); //insert that player at start of array

        console.log(`Dealer is now: ${this.dealer().name}`);
    }

    dealer() {
        return this._players[this._size - 1];
    }
}