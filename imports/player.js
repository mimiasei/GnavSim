'use strict';

import Game from './game.js';
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
		this._isCurrent = false;
		this._hasKnocked = false;
	}

	get name() { return this._name; }
	get pid() { return this._pid; }
	get score() { return this._score; }
	get heldCard() { return this._heldCard; }
	get wins() { return this._wins; }
	get losses() { return this._losses; }
	get neverSwapsWithDeck() { return this._neverSwapsWithDeck; }
	get hasHighscore() { return this._hasHighscore; }
	get isCurrent() { return this._isCurrent; }
	get hasKnocked() { return this._hasKnocked; }

	set name(value) { this._name = value }
	set score(value) { 
		this._score = value;
		this._game.speaker.updateStats(this);
	}
	set heldCard(value) { this._heldCard = value; }
	set wins(value) { this._wins = value; }
	set losses(value) { this._losses = value; }
	set neverSwapsWithDeck(value) { this._neverSwapsWithDeck = value; }
	set hasHighscore(value) {
		this._hasHighscore = value;
		if ((this._hasHighscore !== undefined && this._hasHighscore !== null)) {
			this._game.speaker.say(`${this._name} now has highest score.`);
		}
	}
	set isCurrent(value) { this._isCurrent = value; }

	getIndex() {
		return Player.index++;
	}

	drawFromDeck() {
		this.discard(); //discard currently held card
		this.heldCard = this._game.deck.draw();
		tools.log(`${this._name} drew from deck: ${this.heldCard.name}`, this._game)
	}

	discard() {
		if (this._heldCard !== null) {
			this._game.deck.discard(this._heldCard);
		}
		this._heldCard = null;
	}

	cardSwap(nextPlayer) {
		const card = this._heldCard;

		this._heldCard = nextPlayer.heldCard;
		nextPlayer.heldCard = card;
	}

	askPlayerLoop() {
		let hasSwapped = false;
		let abortSwap = false;
		let nextPlayer = this._game.getPlayerNextTo(true);

		let counter = 0;

		while (nextPlayer && !hasSwapped && !abortSwap && counter < this._game.players.length) {
			tools.log(`${this._name} tries to swap with ${nextPlayer.name}...`, true);

			if (!nextPlayer.isDeck) {
				this.requestSwap(nextPlayer);
				const returnedCard = nextPlayer.answerSwap(this);
				console.log('next player: ' + nextPlayer.name);
				console.log(nextPlayer.name + ' returns the card: ' + returnedCard.name);
				
				if (returnedCard.isFool) {
					this._game.speaker.allLaughAboutFool(nextPlayer, this._pid);
				}

				if (returnedCard.isMatador) {
					//-1 score?
					if (returnedCard.causeLosePoint) {
						this.addToScore(-1);
					}
					//no more swap?
					if (returnedCard.causeNoMoreSwap || returnedCard.causeAllLosePointAndStopGame) {
						abortSwap = true;
					}
					//cuckoo?
					if (returnedCard.causeAllLosePointAndStopGame) {
						this._game.subractFromAllPlayers(nextPlayer);
						this._game.startEvent('endTurn');
					}
				} else {
					//if card is not a matador, swap normally
					this.cardSwap(nextPlayer);
					hasSwapped = true;
				}
				
			} else {
				//next player is the deck, so draw from it
				if (this._neverSwapsWithDeck) {
					this._game.speaker.say(this._name + " never swaps with the deck!");
				} else {
					this._game.speaker.say(this._name + " draws from the deck.");
					this.drawFromDeck();
				}

				hasSwapped = true;
			}

			if (abortSwap || hasSwapped) {
				this._game.playerStack.resetNextTo();
			}

			nextPlayer = this._game.getPlayerNextTo(true);

			counter++;
		} 

	}
	
	requestSwap(toPlayer) {
		// this._game.speaker.say (this.sayTo(toPlayer, 0) + tools.quote(tools.TXT_WANT_TO_SWAP));
		this._game.speaker.speech(this._name, tools.quote(tools.TXT_WANT_TO_SWAP));
	}

	answerSwap(fromPlayer) {
		const quote = this._heldCard.isMatador ? this._heldCard.statement : tools.TXT_ACCEPT_SWAP;
		// this._game.speaker.say (this.sayTo(fromPlayer, 1) + tools.quote(quote));
		this._game.speaker.speech(this._name, tools.quote(quote));
		return this._heldCard;
	}

	prepareSwap() {
		const nextPlayer = this._game.getPlayerNextTo();
		this.testForSwap(nextPlayer);
	}

	finalizeSwap(result) {
		console.log('finalizing swap. wants to swap? ' + result);

		if (result) { //wants to swap
			this.askPlayerLoop();
		} else { //doesn't want to swap
			this._game.speaker.say(`${this._name} doesn't want to swap.`);
			this._game.speaker.speech(this._name, tools.TXT_PASS);
		}

		this._hasKnocked = false; //reset hasknocked after swap is done.

		this._game.startEvent('afterSwap');
	}

	addToScore(value) {
		this.score += value;
		let verb = value > 0 ? 'added' : 'subtracted';
		let prepos = value > 0 ? 'to' : 'from';
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
		this._game.speaker.say(tools.TXT_NO_WAY_FOOL, player.name);
	}

	knockOnTable() {
		this._game.speaker.say (this._name + tools.TXT_KNOCK);
		this._hasKnocked = true;
		return true;
	}

	/**
	 * Test with fuzziness to simulate human error
	 * so AI doesn't always use threshold nbr as reference
	 * for swapping or not.
	 */
	testForSwap(nextPlayer) {
		nextPlayer = nextPlayer || null;

		if (this._heldCard) {
			let swap = tools.SWAP_THRESHOLDNUMBER + 4;
			const chance = Math.random();
 
			if (chance < tools.SWAP_FUZZINESS) {
				swap--;
			} else if (chance > (1 - tools.SWAP_FUZZINESS)) {
				swap++;
			}

			let result = !(this._heldCard.value > swap);

			//if nextPlayer has knocked, meaning he/she has the Fool
			if (nextPlayer && nextPlayer.hasKnocked) {
				if (chance > tools.SWAP_FUZZINESS) {
					this.sayNoFool(nextPlayer);
					result = false;
				} else {
					result = true;
				}
			}

			//this._game.state = result ? Game.STATE_DECIDED_SWAP : Game.STATE_SKIPPED_SWAP; 
			result ? this._game.startEvent('decidedSwap') : this._game.startEvent('skippedSwap');

		} else {
			tools.log(`ERROR: ${this._name} doesn't have valid card!`, this._game);
		}
		return false;
	}
}