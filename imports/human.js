'use strict';

import Player from './player.js';
import Game from './game.js';
import * as tools from './gnavtools.js';

export default class Human extends Player {

	constructor(name, game) {
		super(name, game);
		this._human = true;
		this._hasKnocked = false;
	}

	get human() { return this._human; }
	get heldCard() { return super.heldCard; }
	get hasKnocked() { return this._hasKnocked; }

	set human(value) { this._human = value; }
	set heldCard(value) {
		super.heldCard = value;
		this.printGotCard(super.heldCard.name);
	}
	 
	reset() {
		this._hasKnocked = false;
	}

	knockOnTable() {
		this._game.speaker.say (this.name + tools.TXT_KNOCK);
		this._hasKnocked = true;
	}

	requestSwap(toPlayer) {
		// this._game.speaker.say (this.sayTo(toPlayer, 0) + tools.quote(tools.TXT_WANT_TO_SWAP));
		this._game.speaker.speech(this._name, tools.quote(tools.TXT_WANT_TO_SWAP));
	}

	printGotCard(cardName) {
		cardName = cardName || '';
		let card = cardName === '' ? this._heldCard.name : cardName;
		this._game.speaker.say (`Player ${this.name}, you got the card ${card}.`);
	}

	testForSwap(obj) {
		if (obj) {
			let text = 'Do you want to ';
			if (obj.name == 'deck') {
				text += 'draw from the deck';
			} else {
				text += `swap cards with ${obj.name}`;
			}

			let callbackFn = (result) => {
				this._game.state = result ? this._game.startEvent('decidedSwap') : this._game.startEvent('skippedSwap');
			};

			this._game.speaker.ask(text, 0, callbackFn);

		} else {
			tools.log('testForSwap obj is undefined!');
			return false;
		}
	}
}