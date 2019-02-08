'use strict';

// import * as tools from './gnavtools.js';

export default class Stack {

	constructor(players) {
        this._players = players.slice();
        this._size = players.length;
        this._dealerIndex = -1;
        this._currentIndex = 0;
        this._addIndex = 1;
        this._players[0].isCurrent = true;
    }

    get players() { return this._players }
    get current() { return this._players[this._currentIndex] || { name: 'Undefined!' } }
    get dealer() { return this._players[this._dealerIndex] || { name: 'Undefined!' } }

    hasNextPlayer() {
        const oldIndex = this._currentIndex;
        const index = this.verifyIndex(this._currentIndex + 1);

        if (index === 0 || index < oldIndex) {
            return index < this._dealerIndex + 1;
        }

        return index >= this._dealerIndex;
    }

    nextPlayer() {
        this._currentIndex = this.verifyIndex(++this._currentIndex);
    }

    getNextTo() {
        let index = this._currentIndex + this._addIndex++;
        index = this.verifyIndex(index);

        if (index === this._dealerIndex + 1) {
            this.resetNextTo();
            return this.deck();
        }

        return this._players[index];
    }

    resetNextTo() {
        this._addIndex = 1;
    }

    nextDealer() {
        this._dealerIndex = this.verifyIndex(++this._dealerIndex);
        
        this.reset();
    }

    reset() {
        this._currentIndex = this._dealerIndex + 1;
        this._currentIndex = this.verifyIndex(this._currentIndex);

        this.resetNextTo();
    }

    verifyIndex(index) {
        return index === this._size ? 0 : index;
    }
    
    deck() {
        return { name: 'deck', isDeck: true };
    }

    printStack() {
        console.log('dealer: ' + this.dealer.name + ', is current: ' + this.dealer.isCurrent);

        this._players.forEach((player, index) => {
            console.log(index + ': ' + player.name + ', is current: ' + player.isCurrent);
        });
    }
}