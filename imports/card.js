'use strict';

export default class Card {

	static get types() {
		return {		
			'Gjøken': 21,
			'Dragonen': 20,
			'Katten': 19,
			'Hesten': 18,
			'Huset': 17,
			'(12)': 16,
			'(11)': 15,
			'(10)': 14,
			'(9)': 13,
			'(8)': 12,
			'(7)': 11,
			'(6)': 10,
			'(5)': 9,
			'(4)': 8,
			'(3)': 7,
			'(2)': 6,
			'(1)': 5,
			'Narren': 4,
			'Potten': 3,
			'Uglen': 2,
			'(0)': 1
		};
	};

	static get statements() {
		return {
			21: 'Stå for gjøk!',
			20: 'Hogg av!',
			19: 'Kiss!',
			18: 'Hest forbi!',
			17: 'Hus forbi!'
		};
	};
	
	constructor (name, value) {
		this.name = name || "";
		this.value = value || 0;
		this.statement = "";
		this.isMatador = false;
		this.causeNoMoreSwap = false;
		this.causeLosePoint = false;
		this.causeAllLosePointAndStopGame = false;
		this.isFool = false;
	}
}