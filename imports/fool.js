'use strict';

import Card from './card.js';

export default class Fool extends Card {

	constructor() {
		this.name = "Narren";
		this.value = 4;
		this.statement = "<Bank bank bank>!";
		this.isFool = true;
	}
}