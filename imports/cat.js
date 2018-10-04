'use strict';

import Card from './card.js';

export default class Cat extends Card {

	constructor() {
		this.name = "Katten";
		this.value = 19;
		this.statement = "Kiss!";
		this.isMatador = true;
		this.causeLosePoint = true;
	}
}