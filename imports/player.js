'use strict';

export default class Player {

	constructor(name, pid, speaker) {
		this.name = name;
		this.pid = pid;
		this.speaker = speaker;
		this.score = 5;
		this.heldCard = null;
		this.wins = 0;
		this.losses = 0;
		this.neverSwapsWithDeck = false;
	}

	setHeldCard(card, silent = false) {
		this.heldCard = card;
		//if not silent: speaker.say ("INFO: " + this.name + " now has: " + this.heldCard.name)
	}

	drawFromDeck(deck) {
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
		return this.name + this.TXT_PASSES
	}

	sayNoFool(player) {
		return this.TXT_NO_WAY_FOOL % (player.name)
	}

	knockOnTable() {
		speaker.say (this.name + this.TXT_KNOCK)
		return true
	}

	testForSwap(toPlayer = null) {
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
	}
}

export class Human extends Player {

	constructor() {
		this.human = true;
	}

	setHeldCard(card, silent = false) {
		this.printGotCard(card.name);
		super.setHeldCard(card, silent);
	}

	knockOnTable() {
		result = speaker.ask("Knock on the table", 0) === 0;
		if (result) {
			speaker.say (this.name + this.TXT_KNOCK);
		}
		return result
	}

	requestSwap(toPlayer) {
		speaker.say (this.sayTo(toPlayer, 0) + quote(this.TXT_WANT_TO_SWAP));
	}

	printGotCard(cardName = "") {
		card = cardName === "" ? this.heldCard.name : cardName;
		speaker.say ("Player ${his.name}, you got the card ${card}.");
	}

	testForSwap(toPlayer) {
		let text = "Do you want to ";
		if (toPlayer == "deck") {
			text += "draw from the deck";
		} else {
			text += "swap cards with ${toPlayer.name}";
		}
		return speaker.ask(text, 0) === 0;	
	}
}