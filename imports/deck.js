'use strict';

import Card from './card.js';
import * as tools from './gnavtools.js';

export default class Deck {

	constructor() {
		this.cards = [];
		this.discardPile = [];
		for(let i = 0; i < Card.types.len; i++) {
			this.cards.push(Card.types[i]);
			this.cards.push(Card.types[i]);
		}
		this.shuffleDeck();
	}

	shuffleDeck() {
		console.log ("*** INFO: The deck is shuffled.");
		this.cards = tools.shuffle(this.cards);
	}

	draw() {
		let card = null;
		if (this.isDeckEmpty()) {
			this.useDiscardPile();
		}
		return this.cards.pop();
	}

	useDiscardPile() {
		console.log("**** INFO: The discard deck is used.");
		this.cards = this.discardPile;
		this.shuffleDeck();
		this.discardPile = [];
	}

	isDeckEmpty() {
		return this.cards.len === 0;
	}

	discard(card) {
		this.discardPile.push(card);
		//console.log ("INFO: A %s card was discarded." % (card.name));
	}

	testLengthSum() {
		if (len(this.cards) + len(this.discardPile) !== 42) {
			console.log ("INFO: Warning! Sum of piles is not 42.");
			this.printCards();
			this.printCards(true);
		}
	}

	printCards(discarded = false) {
		let cardsLine = discarded ? "Discarded: " : "Cards: ";
		let cardList = discarded ? this.discardPile : this.cards;
		for (let card of cardList) {
			cardsLine += card.name + ", ";
		}
		cardsLine = cardsLine.slice(0, cardsLine.length - 2);
		console.log (cardsLine);
	}
}