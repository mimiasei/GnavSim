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
        this._playerIndeces = [];
    }

    get players() { return this._players }
    get current() { return this._players[this._currentIndex] || { name: 'Undefined!' } }
    get dealer() { return this._players[this._dealerIndex] || { name: 'Undefined!' } }

    hasNextPlayer() {
        return this._playerIndeces.length > 0;
    }

    /**
     * Sets current player index to first index of player indeces stack,
     * removing it from stack.
     */
    nextPlayer() {
        this._currentIndex = this._playerIndeces.shift(); //ex: [0, 1, 2].shift() returns 0 and leaves [1, 2]
    }

    getNextTo() {
        const index = this._addIndex < this._playerIndeces.length ? this._playerIndeces[this._addIndex] : -1;
        
        if (index < 0) {
            this.resetNextTo();
            return this.deck();
        }
        
        // this.resetNextTo();
        
        return this._players[index];
    }

    resetNextTo() {
        this._addIndex = 0;
    }

    nextDealer() {
        this._dealerIndex = this.verifyIndex(++this._dealerIndex);   
        this.reset();
        this.generateStack();
    }

    /**
     * Generates stack of player indeces,
     * starting from dealer index + 1
     */
    generateStack() {
        this._playerIndeces = [];

        let i = this._dealerIndex + 1;

        for (let c = 0; c < this._players.length; c++) {
            if (i >= this._players.length) {
                i = 0;
            }

            this._playerIndeces.push(i++);
        }

        this.nextPlayer();
        console.log(this._playerIndeces);
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