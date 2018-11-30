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
		this._hasHighscore = false;
	}

	get name() { return this._name; }
	get pid() { return this._pid; }
	get score() { return this._score; }
	get heldCard() { return this._heldCard; }
	get wins() { return this._wins; }
	get losses() { return this._losses; }
	get neverSwapsWithDeck() { return this._neverSwapsWithDeck; }
	get hasHighscore() { return this._hasHighscore; }

	set name(value) { this._name = value }
	set score(value) { 
		this._score = value;
		this._game.speaker.updateStats(this);
	}
	set heldCard(value) { this._heldCard = Card.clone(value) }
	set wins(value) { this._wins = value }
	set losses(value) { this._losses = value }
	set neverSwapsWithDeck(value) { this._neverSwapsWithDeck = value }
	set hasHighscore(value) {
		this._hasHighscore = value;
		if (this._hasHighscore) {
			this._game.speaker.say(`${this._name} now has highest score.`);
		}
	}

	static clone(player) {
		let cloned = Object.assign (Object.create (Object.getPrototypeOf (player)), player);
		cloned.name = player.name;
		cloned.pid = player.pid;
		cloned.game = player.game;
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

	drawFromDeck() {
		this.discard(this._game.deck);
		let result = this._game.deck.draw();
		this.heldCard = result;
	}

	discard() {
		if (this._heldCard !== null) {
			this._game.deck.discard(this._heldCard);
		}
		this._heldCard = null;
	}

	async wantsToSwapTest(withPlayer) {

		let wantsToSwap = false;
		let running = true;
	
		if (withPlayer !== 'deck') {
			running = false;
	
			const watchCallback = async (result) => {
				running = true;
				await this.swapCards(withPlayer, result, wantsToSwap);
			}
	
			await this.testForSwap(watchedObj); //Do small chance check if player has forgotten someone knocked 3 times.
	
		} else {
			if (this.testForSwap('deck')) { //Only swap if card is 4 or less.
				this._game.speaker.say (this._name + ' draws from the deck.');
				this.drawFromDeck(); //Draw from deck if noone else to swap with.
			} else {
				this._game.speaker.say (this.sayPass());
			}
		}
	}

	async swapCards(withPlayer, result, wantsToSwap) {
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
			if (!this._game.askPlayers(index, game)) { //Check if Staa for gjok! is called.
				running = false;
			}
		}
		else {
			this._game.speaker.say(sayPass);
		}
	}

	askPlayers(nbr) {
		console.log('entered askPlayers() with index for player: ' + this._name);
		let nextAdd = 1;
		let hasSwapped, dragonen = false;
		let returnedCard = null;
	
		while (!hasSwapped && !dragonen && (nbr + nextAdd) < this._game.players.length) {
			this.requestSwap(this._game.players[nbr + nextAdd]);
			returnedCard = this._game.players[nbr + nextAdd].answerSwap(this);
	
			if (returnedCard.constructor.name === 'Fool') {
				this._game.speaker.say ("Everyone starts laughing and says 'Men " + this._game.players[nbr + nextAdd].name + " har jo narren!'");
			}
	
			result = this.processAnswer(returnedCard);
	
			switch (result) {
				case 1:		nextAdd++; //Hesten or huset
							break;
				case 2:		this.addToScore(-1); //katten
							nextAdd++;
							break;
				case 3:		dragonen = true; //dragonen
							this.addToScore(-1);
							break;
				case 4:		subractFromAllPlayers(this._game.players[nbr + nextAdd], this._game.players); //gjoeken
							return false;
				default:	this.swapWithPlayer(this._game.players[nbr + nextAdd]); //The two players Swap cards
							hasSwapped = true;
							break;
			}
	
			//If player still hasn't swapped after being last in round
			if (!hasSwapped) {
				this._game.speaker.say (this._game.players[index].name + " draws from the deck.");
				this._game.players[index].drawFromDeck();
			}
		}

		return true;
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
		this.score += value;
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