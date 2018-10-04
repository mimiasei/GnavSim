'use strict';

import Player from './player.js';

export default class Human extends Player {

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