'use strict';

export default class Card {

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

	get name() { return this.name; }
	get value() { return this.value; }
	get statement() { return this.statement; }
	get isMatador() { return this.isMatador; }
	get causeNoMoreSwap() { return this.causeNoMoreSwap; }
	get causeLosePoint() { return this.causeLosePoint; }
	get causeAllLosePointAndStopGame() { return this.causeAllLosePointAndStopGame; }
	get isFool() { return this.isFool; }

	set name(name) { this.name = name; }
	set value(value) { this.value = value; }
	set statement(statement) { this.statement = statement; }
	set isMatador(isMatador) { this.isMatador = isMatador; }
	set causeNoMoreSwap(causeNoMoreSwap) { this.causeNoMoreSwap = causeNoMoreSwap; }
	set causeLosePoint(causeLosePoint) { this.causeLosePoint = causeLosePoint; }
	set causeAllLosePointAndStopGame(causeAllLosePointAndStopGame) { this.causeAllLosePointAndStopGame = causeAllLosePointAndStopGame; }
	set isFool(isFool) { this.isFool = isFool; }

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

}