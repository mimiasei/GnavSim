'use strict';

import Card from './card.js';

export default class Horse extends Card {

	constructor() {
		super();
		this.name = "Hesten";
		this.value = 18;
		this.statement = "Hest forbi!";
		this.isMatador = true;
	}

	async carboncopy() {
		let clone = new Horse(this._name, this._value);
		clone.statement = this._statement;
		clone.isMatador = this._isMatador;
		clone.causeNoMoreSwap = this._causeNoMoreSwap;
		clone.causeLosePoint = this._causeLosePoint;
		clone._causeAllLosePointAndStopGame = this._causeAllLosePointAndStopGame;
		clone.isFool = this._isFool;

		return clone;
	}
}