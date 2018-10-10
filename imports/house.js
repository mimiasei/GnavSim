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
}