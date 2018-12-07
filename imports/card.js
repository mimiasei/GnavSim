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

	static get typesLength() {
		return Object.keys(Card.types).length;
	}

	static type(index) {
		return Object.keys(this.types)[index];
	}

	async clone() {
		return Object.assign( Object.create( Object.getPrototypeOf(this)), this);
	}

	static deepCopy(card) {
		return JSON.parse(JSON.stringify(card));
	}

	test(clone) {
		if (clone instanceof Card) {
			console.log('clone is instance of Card class');
		} else {
			console.log('clone is NOT instance of Card class!');
		}

		if (JSON.stringify(clone) === JSON.stringify(this)) {
			console.log('clone properties equal to this');
		} else {
			console.log('clone properties ARE NOT equal to this!');
		}
	}
}