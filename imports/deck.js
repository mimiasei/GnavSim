'use strict';

import Card from './card.js';
import * as tools from './gnavtools.js';
import Cuckoo from './cuckoo.js';
import Dragoon from './dragoon.js';
import Cat from './cat.js';
import Horse from './horse.js';
import House from './house.js';
import Fool from './fool.js';

export default class Deck {

	constructor() {
	}

	get cards() { return this._cards }
	get discardPile() { return this._discardPile }

	set cards(value) { this._cards = Array.from(value) }
	set discardPile(value) { this._discardPile = Array.from(value) }

	async init() {
		await this.buildDeck();
		await this.shuffleDeck();
	}

	async buildDeck() {
		this._cards = [];
		this._discardPile = [];
		let card = null;

		for (const i of tools.range(0, Card.typesLength - 1)) {
			switch (i) {
				case 0:
					card = new Cuckoo();
					break;
				case 1:
					card = new Dragoon();
					break;
				case 2:
					card = new Cat();
					break;
				case 3:
					card = new Horse();
					break;
				case 4:
					card = new House();
					break;
				case 17:
					card = new Fool();
					break;
				default:
					card = new Card(Card.type(i), Card.types[Card.type(i)]);
					break;
			}
			this._cards.push(card); //need two of same card type
			this._cards.push(card);
		}
	}

	async shuffleDeck() {
		tools.log ('*** INFO: The deck is being shuffled.');
		const cardsPromise = tools.shuffle(this._cards);
		this._cards = await cardsPromise;
	}

	draw() {
		if (this.isDeckEmpty()) {
			this.useDiscardPile();
		}
		let card = this._cards.pop();
		return card;
	}

	useDiscardPile() {
		tools.log('**** INFO: The discard deck is used.');
		this._cards = Array.from(this._discardPile);
		this.shuffleDeck();
		this._discardPile = [];
	}

	isDeckEmpty() {
		return this._cards.length === 0;
	}

	discard(card) {
		this._discardPile.push(card);
	}

	getLength() {
		return this._cards.length;
	}

	testLengthSum() {
		if (this._cards.length + this._discardPile.length !== 42) {
			tools.log ('INFO: Warning! Sum of piles is not 42.');
			this.printCards();
			this.printCards(true);
		}
	}

	printCards(discarded = false) {
		let cardsLine = discarded ? 'Discarded: ' : 'Cards: ';
		let cardList = discarded ? this._discardPile : this._cards;
		for (let card of cardList) {
			cardsLine += card.name + ', ';
		}
		cardsLine = cardsLine.slice(0, cardsLine.length - 2);
		tools.log (cardsLine);
	}
}