'use strict';

import Card from './card.js';

export default class Cat extends Card {

	constructor() {
		super();
		this.name = "Katten";
		this.value = 19;
		this.statement = "Kiss!";
		this.isMatador = true;
		this.causeLosePoint = true;
	}

	async carboncopy() {
		let clone = new Cat(this._name, this._value);
		clone.statement = this._statement;
		clone.isMatador = this._isMatador;
		clone.causeNoMoreSwap = this._causeNoMoreSwap;
		clone.causeLosePoint = this._causeLosePoint;
		clone._causeAllLosePointAndStopGame = this._causeAllLosePointAndStopGame;
		clone.isFool = this._isFool;

		return clone;
	}
}