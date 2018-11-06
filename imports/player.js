'use strict';

import Deck from './deck.js';
import Card from './card.js';
import * as tools from './gnavtools.js';

export default class Player {

	constructor(name, speaker) {
		this._name = name || '';
		this._pid = this.getIndex();
		this._speaker = speaker || null;
		this._score = 5;
		this._heldCard = null;
		this._wins = 0;
		this._losses = 0;
		this._neverSwapsWithDeck = false;
	}

	get name() { return this._name; }
	get pid() { return this._pid; }
	get speaker() { return this._speaker; }
	get score() { return this._score; }
	get heldCard() { return this._heldCard; }
	get wins() { return this._wins; }
	get losses() { return this._losses; }
	get neverSwapsWithDeck() { return this._neverSwapsWithDeck; }

	set name(value) { this._name = value }
	// set pid(value) { this._pid = value }
	set speaker(value) { this._speaker = value }
	set score(value) { this._score = value }
	set heldCard(value) { this._heldCard = Card.clone(value) }
	set wins(value) { this._wins = value }
	set losses(value) { this._losses = value }
	set neverSwapsWithDeck(value) { this._neverSwapsWithDeck = value }

	static clone(player) {
		let cloned = Object.assign (Object.create (Object.getPrototypeOf (player)), player);
		cloned.name = player.name;
		cloned.pid = player.pid;
		cloned.speaker = Speaker.clone(player.speaker);
		cloned.score = player.score;
		cloned.heldCard = Card.clone(player.heldCard);
		cloned.wins = player.wins;
		cloned.losses = player.losses;
		cloned.neverSwapsWithDeck = player.neverSwapsWithDeck;
		return cloned;
	}

	getIndex() {
		return this.index++;
	}

	drawFromDeck(deck) {
		// Object.setPrototypeOf(deck, Deck.prototype);
		this.discard(deck);
		let result = deck.draw();
		this.heldCard = result;
	}

	discard(deck) {
		// Object.setPrototypeOf(deck, Deck.prototype);
		if (this._heldCard !== null) {
			deck.discard(this._heldCard);
		}
		this._heldCard = null;
	}
	
	requestSwap(toPlayer) {
		this._speaker.say (this.sayTo(toPlayer, 0) + quote(tools.TXT_WANT_TO_SWAP));
	}

	answerSwap(fromPlayer) {
		let val = this._heldCard.value;
		if (val <= 16) {
			this._speaker.say (this.sayTo(fromPlayer, 1) + quote(tools.TXT_ACCEPT_SWAP));
		}
		else {
			let reply = val < 21 ? Card.statement(val) : Card.statement(val).toUpperCase();
			this._speaker.say (this.sayTo(fromPlayer, 1) + quote(reply));
		}
		return val;
	}

	swapWithPlayer(fromPlayer) {
		console.log("swapping...");
		this._speaker.say (`INFO: ${this.name} swaps cards with ${fromPlayer.name}.`);
		let card = jQuery.extend(true, {}, this._heldCard);
		console.log(card);
		this._heldCard = jQuery.extend(true, {}, fromPlayer.heldCard);
		console.log(this._heldCard);
		fromPlayer.heldCard = jQuery.extend(true, {}, card);
	}

	processAnswer(returnedCardValue) {
		if (returnedCardValue > 16) { //If one of the matador cards (better than (12))
			if (returnedCardValue == 17 || returnedCardValue == 18) { //huset, hesten
				return 1; //must ask next player.
			} else if (returnedCardValue == 19) { //katten
				return 2; //Loses 1 score and must ask next player.
			} else if (returnedCardValue == 20) { //dragonen
				return 3; //Loses 1 score.
			} else if (returnedCardValue == 21) { //gjoeken
				return 4; //Turn is over for all players.
			}
		} else {
			return 0; //Nothing happens.
		}
	}

	addToScore(value) {
		this._score += value;
		let verb = value > 0 ? "added" : "subtracted";
		let prepos = value > 0 ? "to" : "from";
		this._speaker.say (`${this.name} ${verb} ${Math.abs(value)} ${prepos} score.`);
	}

	sayTo(toPlayer, typ) {
		let verb = typ == 0 ? ' asks ' : ' answers ';
		return this._name + verb + toPlayer.name + ": ";
	}

	sayPass() {
		return this._name + tools.TXT_PASSES;
	}

	sayNoFool(player) {
		console.log("saying no fool...");
		return tools.highlight(tools.TXT_NO_WAY_FOOL, player.name);
	}

	knockOnTable() {
		this._speaker.say (this._name + tools.TXT_KNOCK);
		return true;
	}

	testForSwap(toPlayer = null) {
		if (this._heldCard) {
			let value = this._heldCard.value;
			let swap = tools.SWAP_THRESHOLDNUMBER + 4;
			let chance = Math.random();
			if (chance < tools.SWAP_FUZZINESS) {
				swap--;
			} else if (chance > 1 - tools.SWAP_FUZZINESS) {
				swap++;
			}

			if (value > swap) {
				return false; //Player doesn't want to swap and will say pass.
			} else {
				return true; //Player wants to swap.
			}
		} else {
			return false;
		}
	}
}