'use strict';

import Card from './card.js';

export default class Dragoon extends Card {

	constructor() {
		this.name = "Dragonen";
		this.value = 20;
		this.statement = "Hogg av!";
		this.isMatador = true;
		this.causeNoMoreSwap = true;
		this.causeLosePoint = true;
	}
}