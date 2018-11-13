import Speaker from './speaker.js';

export default class Game {

	constructor(playType, maxValue, isHuman) {
		playType = playType || 0;
		maxValue = maxValue || 0;
		isHuman = isHuman || false;
		
		this._playType = playType; //0 = max ROUNDS, 1 = reach SCORE
		this._value = 0; //current value, either ROUND or highest SCORE
		this._maxValue = maxValue; //value to reach, either ROUNDS or SCORE
		this._isHuman = isHuman;
		this._speaker = new Speaker(this);
		this._dealer = 0;
		this._players = [];
	}

	get playType() { return this._playType }
	get value() { return this._value }
	get maxValue() { return this._maxValue }
	get isHuman() { return this._isHuman }
	get round() { return this._round }
	get dealer() { return this._dealer }
	get players() { return this._players }
	get speaker() { return this._speaker }

	set playType(value) { this._playType = value }
	set value(value) { this._value = value }
	set maxValue(value) { this._maxValue = value }
	set isHuman(value) { this._isHuman = value }
	set players(value) { this._players = Array.from(value) }

	isGameOver() {
		return (this._value >= this._maxValue);
	}

	incValue() {
		this._value++;
		this._dealer++;
		if (this._dealer > this._players.length - 1) {
			this._dealer = 0;
		}
	}

	getDealerPlayer() {
		return this._players[this._dealer];
	}
}