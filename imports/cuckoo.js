'use strict';

import Card from './card.js';

export default class Cuckoo extends Card {

	constructor() {
		super();
		this.name = "Gjøken";
		this.value = 21;
		this.statement = "Stå for gjøk!";
		this.isMatador = true;
		this.causeAllLosePointAndStopGame = true;
	}

	async carboncopy() {
		let clone = new Cuckoo(this._name, this._value);
		clone.statement = this._statement;
		clone.isMatador = this._isMatador;
		clone.causeNoMoreSwap = this._causeNoMoreSwap;
		clone.causeLosePoint = this._causeLosePoint;
		clone._causeAllLosePointAndStopGame = this._causeAllLosePointAndStopGame;
		clone.isFool = this._isFool;

		return clone;
	}
}