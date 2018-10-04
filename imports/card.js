'use strict';

export default class Card {

	static get types() {
		return {		
			'Gjøken': 21,
			'Dragonen': 20,
			'Katten': 19,
			'Hesten': 18,
			'Huset': 17,
			'(12)': 16,
			'(11)': 15,
			'(10)': 14,
			'(9)': 13,
			'(8)': 12,
			'(7)': 11,
			'(6)': 10,
			'(5)': 9,
			'(4)': 8,
			'(3)': 7,
			'(2)': 6,
			'(1)': 5,
			'Narren': 4,
			'Potten': 3,
			'Uglen': 2,
			'(0)': 1
		};
	};

	static get statements() {
		return {
			21: 'Stå for gjøk!',
			20: 'Hogg av!',
			19: 'Kiss!',
			18: 'Hest forbi!',
			17: 'Hus forbi!'
		};
	};
	
	constructor (name, value) {
		this.name = name || "";
		this.value = value || 0;
		this.statement = "";
		this.isMatador = false;
		this.causeNoMoreSwap = false;
		this.causeLosePoint = false;
		this.causeAllLosePointAndStopGame = false;
		this.isFool = false;
	}
}

export class Cuckoo extends Card {

	constructor() {
		this.name = "Gjøken";
		this.value = 21;
		this.statement = "Stå for gjøk!";
		this.isMatador = true;
		this.causeAllLosePointAndStopGame = true;
	}
}

export class Dragoon extends Card {

	constructor() {
		this.name = "Dragonen";
		this.value = 20;
		this.statement = "Hogg av!";
		this.isMatador = true;
		this.causeNoMoreSwap = true;
		this.causeLosePoint = true;
	}
}

export class Cat extends Card {

	constructor() {
		this.name = "Katten";
		this.value = 19;
		this.statement = "Kiss!";
		this.isMatador = true;
		this.causeLosePoint = true;
	}
}

export class Horse extends Card {

	constructor() {
		this.name = "Hesten";
		this.value = 18;
		this.statement = "Hest forbi!";
		this.isMatador = true;
	}
}

export class House extends Card {

	constructor() {
		this.name = "Huset";
		this.value = 17;
		this.statement = "Hus forbi!";
		this.isMatador = true;
	}
}

export class Fool extends Card {

	constructor() {
		this.name = "Narren";
		this.value = 4;
		this.statement = "<Bank bank bank>!";
		this.isFool = true;
	}
}

export class Deck {

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
		this.cards = shuffle(this.cards);
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