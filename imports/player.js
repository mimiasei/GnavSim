'use strict';

import Deck from './deck.js';
import Card from './card.js';

export default class Player {

	constructor(name, pid, speaker) {
		this.name = name || '';
		this.pid = pid || 0;
		this.speaker = speaker || null;
		this.score = 5;
		this.heldCard = null;
		this.wins = 0;
		this.losses = 0;
		this.neverSwapsWithDeck = false;
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
	set pid(value) { this._pid = value }
	set speaker(value) { this._speaker = value }
	set score(value) { this._score = value }
	set heldCard(value) { this._heldCard = value }
	set wins(value) { this._wins = value }
	set losses(value) { this._losses = value }
	set neverSwapsWithDeck(value) { this._neverSwapsWithDeck = value }

	setHeldCard(card, silent = false) {
		this.heldCard = card;
		//if not silent: speaker.say ("INFO: " + this.name + " now has: " + this.heldCard.name)
	}

	drawFromDeck(deck) {
		Object.setPrototypeOf(deck, Deck.prototype);
		this.discard(deck);
		let result = deck.draw();
		this.setHeldCard(result);
	}

	discard(deck) {
		if (this.heldCard !== null) {
			deck.discard(this.heldCard);
		}
		this.heldCard = null;
	}
	
	requestSwap(toPlayer) {
		speaker.say (this.sayTo(toPlayer, 0) + quote(this.TXT_WANT_TO_SWAP));
	}

	answerSwap(fromPlayer) {
		let val = this.heldCard.value;
		if (val <= 16) {
			speaker.say (this.sayTo(fromPlayer, 1) + quote(this.TXT_ACCEPT_SWAP));
		}
		else {
			let reply = val < 21 ? Card.statements[val] : Card.statements[val].upper();
			speaker.say (this.sayTo(fromPlayer, 1) + quote(reply));
		}
		return val;
	}

	swapWithPlayer(fromPlayer) {
		speaker.say ("INFO: ${this.name} swaps cards with ${fromPlayer.name}.");
		let card = this.heldCard;
		this.setHeldCard(fromPlayer.heldCard);
		fromPlayer.setHeldCard(card);
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
		this.score += value;
		let verb = value > 0 ? "added" : "subtracted";
		let prepos = value > 0 ? "to" : "from";
		speaker.say ("${this.name} ${verb} ${Math.abs(value)} ${prepos} score.");
	}

	sayTo(toPlayer, typ) {
		let verb = typ == 0 ? ' asks ' : ' answers ';
		return this.name + verb + toPlayer.name + ": ";
	}

	sayPass() {
		return this.name + this.TXT_PASSES;
	}

	sayNoFool(player) {
		return this.TXT_NO_WAY_FOOL % (player.name);
	}

	knockOnTable() {
		speaker.say (this.name + this.TXT_KNOCK);
		return true;
	}

	testForSwap(toPlayer = null) {
		if (this.heldCard) {
			let value = this.heldCard.value;
			let swap = SWAP_THRESHOLDNUMBER + 4;
			let chance = Math.random();
			if (chance < SWAP_FUZZINESS) {
				swap--;
			} else if (chance > 1 - SWAP_FUZZINESS) {
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