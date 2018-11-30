'use strict';

export default class Card {

	constructor (name, value) {
		this._name = name || "";
		this._value = value || 0;
		this._statement = "";
		this._isMatador = false;
		this._causeNoMoreSwap = false;
		this._causeLosePoint = false;
		this._causeAllLosePointAndStopGame = false;
		this._isFool = false;
	}

	get name() { return this._name; }
	get value() { return this._value; }
	get statement() { return this._statement; }
	get isMatador() { return this._isMatador; }
	get causeNoMoreSwap() { return this._causeNoMoreSwap; }
	get causeLosePoint() { return this._causeLosePoint; }
	get causeAllLosePointAndStopGame() { return this._causeAllLosePointAndStopGame; }
	get isFool() { return this._isFool; }

	set name(val) { this._name = val; }
	set value(val) { this._value = val; }
	set statement(val) { this._statement = val; }
	set isMatador(val) { this._isMatador = val; }
	set causeNoMoreSwap(val) { this._causeNoMoreSwap = val; }
	set causeLosePoint(val) { this._causeLosePoint = val; }
	set causeAllLosePointAndStopGame(val) { this._causeAllLosePointAndStopGame = val; }
	set isFool(val) { this._isFool = val; }

	static get types() {
		return {		
			// 'Gj�ken': 21,
			// 'Dragonen': 20,
			// 'Katten': 19,
			// 'Hesten': 18,
			// 'Huset': 17,
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

	// static get typesSize() {
	// 	return Object.keys(this.types).length;
	// }

	static type(index) {
		return Object.keys(this.types)[index];
	}

	// static get statements() {
	// 	return {
	// 		21: 'Stå for gjøk!',
	// 		20: 'Hogg av!',
	// 		19: 'Kiss!',
	// 		18: 'Hest forbi!',
	// 		17: 'Hus forbi!'
	// 	};
	// };

	// static get statementsSize() {
	// 	return Object.keys(this.statements).length;
	// }

	// static statement(index) {
	// 	return Object.keys(this.statements)[index];
	// }

	static clone(card) {
		let cloned = Object.assign (Object.create (Object.getPrototypeOf (card)), card);
		// cloned.name = card.name;
		// cloned.value = card.value;
		// cloned.statement = card.statement;
		// cloned.isMatador = card.isMatador;
		// cloned.causeNoMoreSwap = card.causeNoMoreSwap;
		// cloned.causeLosePoint = card.causeLosePoint;
		// cloned.causeAllLosePointAndStopGame = card.causeAllLosePointAndStopGame;
		// cloned.isFool = card.isFool;
		return cloned;
	}

}