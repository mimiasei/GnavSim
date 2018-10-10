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
}