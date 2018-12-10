'use strict';

import Card from './card.js';

export default class House extends Card {

	constructor() {
		super();
		this.name = "Huset";
		this.value = 17;
		this.statement = "Hus forbi!";
		this.isMatador = true;
	}

	clone() {
		let clone = new House(this._name, this._value);
		return super.cloneVars(clone);
	}
}