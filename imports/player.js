'use strict';

import Deck from './deck.js';
import Card from './card.js';
import * as tools from './gnavtools.js';

export default class Player {

	/**
	 * Has static vars:
	 * index (int)
	 */

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
	set heldCard(value) { this._heldCard = $.extend(true, {}, value) } //Card.clone(value)
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
		// cloned.name = player.name;
		// cloned.pid = player.pid;
		// cloned.game = player.game;
		// cloned.score = player.score;
		// cloned.heldCard = Card.clone(player.heldCard);
		// cloned.wins = player.wins;
		// cloned.losses = player.losses;
		// cloned.neverSwapsWithDeck = player.neverSwapsWithDeck;
		return cloned;
	}

	getIndex() {
		return Player.index++;
	}

	drawFromDeck() {
		this.discard(this._game.deck);
		this.heldCard = this._game.deck.draw(); //using setter to create clone
	}

	discard() {
		if (this._heldCard !== null) {
			this._game.deck.discard(this._heldCard);
		}
		this._heldCard = null;
	}

	//todo: hoping to get rid of this silly method!
	async wantsToSwapTest(withPlayer) {

		let wantsToSwap = false;
	
		if (withPlayer !== 'deck') {
	
			await this.testForSwap(); //Do small chance check if player has forgotten someone knocked 3 times.
	
		} else {
			if (this.testForSwap('deck')) { //Only swap if card is 4 or less.
				this._game.speaker.say (this._name + ' draws from the deck.');
				this.drawFromDeck(); //Draw from deck if noone else to swap with.
			} else {
				this._game.speaker.say (this.sayPass());
			}
		}
	}

	/**
	 * result = button click result. yes = true, no = false.
	 * 
	 * @param Player withPlayer 
	 * @param bool result 
	 * @param bool wantsToSwap 
	 */
	async swapCards(withPlayer) {
		let sayPass = '';
		let wantsToSwap = false;

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
			const result = await this.askPlayers();
			if (!result) { //Check if Staa for gjok! is called.
				// running = false;
			}
		}
		else {
			this._game.speaker.say(sayPass);
		}
	}

	async askPlayers() {
		tools.log('ASKPLAYERS: entered askPlayers() with index for player: ' + this._name);
		let gotoNextPlayer = false;
		let hasSwapped, abortSwap = false;
		let returnedCard = null;
		let nextPlayer = this._game.getPlayerNextTo();

		while (!hasSwapped && !abortSwap && nextPlayer.name !== 'deck') {

			this.requestSwap(nextPlayer);
			returnedCard = nextPlayer.answerSwap(this);
	
			if (returnedCard.isFool) {
				this._game.speaker.say ("Everyone starts laughing and says 'Men " + nextPlayer.name + " har jo narren!'");
			}
	
			if (returnedCard.isMatador) {
				if (returnedCard.causeAllLosePointAndStopGame) { //gjøken
					subractFromAllPlayers(nextPlayer, this._game.players);
				} else if (returnedCard.causeLosePoint) { //cat, dragoon
					this.addToScore(-1);
					if (returnedCard.causeNoMoreSwap) { //dragoon
						abortSwap = true;
					} else {
						gotoNextPlayer = true; //cat
					}
				} else {
					gotoNextPlayer = true; //horse, house
				}

				// switch (returnedCard.value) {
				// 	case 17:
				// 	case 18:	nextAdd++; //Hesten or huset
				// 				break;
				// 	case 19:	this.addToScore(-1); //katten
				// 				nextAdd++;
				// 				break;
				// 	case 20:	dragonen = true; //dragonen
				// 				this.addToScore(-1);
				// 				break;
				// 	case 21:	subractFromAllPlayers(this._game.players[playerIndex + nextAdd], this._game.players); //gjøken
				// 				return false;
				// }
			} else {
				tools.log('ASKPLAYERS: card is NOT matador. going to swapwithplayer...');
				await this.swapWithPlayer(nextPlayer); //The two players Swap cards
				hasSwapped = true;
			}
	
			//If player still hasn't swapped after being last in round
			if (!hasSwapped) {
				this._game.speaker.say (this._name + " draws from the deck.");
				this.drawFromDeck();
			}

			if (gotoNextPlayer) {
				nextPlayer = this._game.getPlayerNextTo();
			}
		}

		return true;
	}
	
	requestSwap(toPlayer) {
		this._game.speaker.say (this.sayTo(toPlayer, 0) + tools.quote(tools.TXT_WANT_TO_SWAP));
	}

	answerSwap(fromPlayer) {
		const quote = this._heldCard.isMatador ? this._heldCard.statement : tools.TXT_ACCEPT_SWAP;
		this._game.speaker.say (this.sayTo(fromPlayer, 1) + tools.quote(quote));
		return this._heldCard;
	}

	async swapWithPlayer(fromPlayer) {
		tools.log(`SWAPWITHPLAYER: ${this._name} is swapping with ${fromPlayer.name}...`);
		this._game.speaker.say (`INFO: ${this.name} swaps cards with ${fromPlayer.name}.`);
		tools.log('SWAPWITHPLAYER clone: before first clone');
		const card = await this._heldCard.carboncopy();
		tools.log('SWAPWITHPLAYER clone: after first clone');
		this._heldCard = await fromPlayer.heldCard.carboncopy();
		fromPlayer.heldCard = await card.carboncopy();
		card.test(fromPlayer.heldCard);
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
		tools.log("saying no fool...");
		return tools.highlight(tools.TXT_NO_WAY_FOOL, player.name);
	}

	knockOnTable() {
		this._game.speaker.say (this._name + tools.TXT_KNOCK);
		return true;
	}

	/**
	 * Test with fuzziness to simulate human error
	 * so AI doesn't always use threshold nbr as reference
	 * for swapping or not.
	 */
	testForSwap() {
		if (this._heldCard) {
			let swap = tools.SWAP_THRESHOLDNUMBER + 4;
			const chance = Math.random();

			if (chance < tools.SWAP_FUZZINESS) {
				swap--;
			} else if (chance > (1 - tools.SWAP_FUZZINESS)) {
				swap++;
			}

			return !(this._heldCard.value > swap);
		}
		return false;
	}
}