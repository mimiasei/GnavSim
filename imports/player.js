'use strict';

import Deck from './deck.js';
import Card from './card.js';
import * as tools from './gnavtools.js';

export default class Player {

	constructor(name, game) {
		this._name = name || '';
		this._pid = this.getIndex();
		this._game = game || null;
		this._score = 5;
		this._heldCard = null;
		this._wins = 0;
		this._losses = 0;
		this._neverSwapsWithDeck = false;
	}

	get name() { return this._name; }
	get pid() { return this._pid; }
	get score() { return this._score; }
	get heldCard() { return this._heldCard; }
	get wins() { return this._wins; }
	get losses() { return this._losses; }
	get neverSwapsWithDeck() { return this._neverSwapsWithDeck; }

	set name(value) { this._name = value }
	// set pid(value) { this._pid = value }
	set score(value) { this._score = value }
	set heldCard(value) { this._heldCard = Card.clone(value) }
	set wins(value) { this._wins = value }
	set losses(value) { this._losses = value }
	set neverSwapsWithDeck(value) { this._neverSwapsWithDeck = value }

	static clone(player) {
		let cloned = Object.assign (Object.create (Object.getPrototypeOf (player)), player);
		cloned.name = player.name;
		cloned.pid = player.pid;
		cloned.game = Game.clone(player.game);
		cloned.score = player.score;
		cloned.heldCard = Card.clone(player.heldCard);
		cloned.wins = player.wins;
		cloned.losses = player.losses;
		cloned.neverSwapsWithDeck = player.neverSwapsWithDeck;
		return cloned;
	}

	getIndex() {
		return Player.index++;
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

	async wantsToSwapTest(withPlayer, deck) {

		let wantsToSwap = false;
		let running = true;
	
		if (withPlayer !== 'deck') {
			running = false;
	
			const watchCallback = async (result) => {
				running = true;
				await this.swapCards(withPlayer, result, wantsToSwap, deck);
			}
	
			let obj = {
				name : withPlayer.name,
				result : null
			}
			
			const watchedObj = tools.onChange(obj, watchCallback);
	
			await this.testForSwap(watchedObj); //Do small chance check if player has forgotten someone knocked 3 times.
	
		} else {
			if (this.testForSwap('deck')) { //Only swap if card is 4 or less.
				this._game.speaker.say (this._name + ' draws from the deck.');
				this.drawFromDeck(deck); //Draw from deck if noone else to swap with.
			} else {
				this._game.speaker.say (this.sayPass());
			}
		}
	}

	async swapCards(withPlayer, result, wantsToSwap, deck) {
		let sayPass = '';

		if (withPlayer && withPlayer.heldCard && withPlayer.heldCard.isFool) { //If the other player has Narren...
			if (result) {
				wantsToSwap = true;
			}
			else {
				sayPass = this.sayNoFool(withPlayer);
			}
		}
		else {
			if (!this._neverSwapsWithDeck && this.testForSwap(withPlayer)) { //Only ask to swap if card is 4 or less.
				wantsToSwap = true;
			}
			else {
				if (this._neverSwapsWithDeck) {
					this._game.speaker.say(this._name + " never swaps!");
				}
			}
		}
		if (wantsToSwap) {
			// if (!askPlayers(index, game.players[index], game.players, deck, speaker)) { //Check if Staa for gjok! is called.
			if (!askPlayers(index, game, deck)) { //Check if Staa for gjok! is called.
				running = false;
			}
		}
		else {
			this._game.speaker.say(sayPass);
		}
	}
	
	requestSwap(toPlayer) {
		this._game.speaker.say (this.sayTo(toPlayer, 0) + tools.quote(tools.TXT_WANT_TO_SWAP));
	}

	answerSwap(fromPlayer) {
		// let val = this._heldCard.value;
		// if (val <= 16) {
		if (!this._heldCard.isMatador) {
			this._game.speaker.say (this.sayTo(fromPlayer, 1) + tools.quote(tools.TXT_ACCEPT_SWAP));
		}
		else {
			// let reply = val < 21 ? Card.statement(val) : Card.statement(val).toUpperCase();
			this._game.speaker.say (this.sayTo(fromPlayer, 1) + tools.quote(this._heldCard.statement)); //reply
		}
		// return val;
		return this._heldCard;
	}

	swapWithPlayer(fromPlayer) {
		console.log("swapping...");
		this._game.speaker.say (`INFO: ${this.name} swaps cards with ${fromPlayer.name}.`);
		let card = jQuery.extend(true, {}, this._heldCard);
		console.log(card);
		this._heldCard = jQuery.extend(true, {}, fromPlayer.heldCard);
		console.log(this._heldCard);
		fromPlayer.heldCard = jQuery.extend(true, {}, card);
	}

	processAnswer(returnedCard) {
		if (returnedCard.isMatador) { //If one of the matador cards
			switch (returnedCard.constructor.name) {
				case 'House':
				case 'Horse':	return 1;
				case 'Cat': 	return 2;
				case 'Dragoon':	return 3;
				case 'Cuckoo':	return 4;
				default:		return 0;
			}
		} else {
			return 0;
		}
	}

	addToScore(value) {
		this._score += value;
		console.log(this._name, this._score);
		let verb = value > 0 ? "added" : "subtracted";
		let prepos = value > 0 ? "to" : "from";
		this._game.speaker.say (`${this.name} ${verb} ${Math.abs(value)} ${prepos} score.`);
	}

	sayTo(toPlayer, typ) {
		let verb = typ === 0 ? ' asks ' : ' answers ';
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
		this._game.speaker.say (this._name + tools.TXT_KNOCK);
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