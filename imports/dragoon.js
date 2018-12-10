'use strict';

import Card from './card.js';

export default class Dragoon extends Card {

	constructor() {
		super();
		this.name = "Dragonen";
		this.value = 20;
		this.statement = "Hogg av!";
		this.isMatador = true;
		this.causeNoMoreSwap = true;
		this.causeLosePoint = true;
	}

	async carboncopy() {
		let clone = new Dragoon(this._name, this._value);
		clone.statement = this._statement;
		clone.isMatador = this._isMatador;
		clone.causeNoMoreSwap = this._causeNoMoreSwap;
		clone.causeLosePoint = this._causeLosePoint;
		clone._causeAllLosePointAndStopGame = this._causeAllLosePointAndStopGame;
		clone.isFool = this._isFool;

		return clone;
	}
}