'use strict';

import Player from './player.js';
import Card from './card.js';

export default class Human extends Player {

	constructor(name, speaker) {
		super(name, speaker);
		this._human = true;
	}

	get human() { return this._human; }

	set human(value) { this._human = value; }
	set heldCard(value) {
		super.heldCard = value;
		this.printGotCard(super.heldCard.name);
 	}

	knockOnTable() {
		result = speaker.ask("Knock on the table", 0) === 0;
		if (result) {
			speaker.say (this.name + tools.TXT_KNOCK);
		}
		return result
	}

	requestSwap(toPlayer) {
		this._speaker.say (this.sayTo(toPlayer, 0) + quote(tools.TXT_WANT_TO_SWAP));
	}

	printGotCard(cardName) {
		cardName = cardName || '';
		let card = cardName === '' ? this._heldCard.name : cardName;
		this._speaker.say (`Player ${this.name}, you got the card ${card}.`);
	}

	testForSwap(toPlayer) {
		if (toPlayer) {
			let text = "Do you want to ";
			if (toPlayer == "deck") {
				text += "draw from the deck";
			} else {
				text += `swap cards with ${toPlayer.name}`;
			}
			return this._speaker.ask(text, 0) === 0;
		} else {
			console.log('toPlayer is undefined!');
			return false;
		}
	}
}