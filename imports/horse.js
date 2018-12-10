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
}