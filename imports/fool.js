'use strict';

import Card from './card.js';

export default class Fool extends Card {

	constructor() {
		super();
		this.name = "Narren";
		this.value = 4;
		this.statement = "<Bank bank bank>!";
		this.isFool = true;
	}

	async carboncopy() {
		let clone = new Fool(this._name, this._value);
		clone.statement = this._statement;
		clone.isMatador = this._isMatador;
		clone.causeNoMoreSwap = this._causeNoMoreSwap;
		clone.causeLosePoint = this._causeLosePoint;
		clone._causeAllLosePointAndStopGame = this._causeAllLosePointAndStopGame;
		clone.isFool = this._isFool;

		return clone;
	}
}