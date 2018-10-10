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
}