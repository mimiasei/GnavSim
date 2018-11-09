import Speaker from './speaker.js';

export default class Game {

	constructor(playType, maxValue, isHuman) {
		playType = playType || 0;
		maxValue = maxValue || 0;
		isHuman = isHuman || false;
		
		this._playType = playType; //0 = max rounds, 1 = reach score
		this._value = 0; //current value, either round or highest score
		this._maxValue = maxValue; //value to reach, either rounds or score
		this._isHuman = isHuman;
		this._speaker = new Speaker(this);
		this._nextTurn = true;
	}

	get playType() { return this._playType }
	get value() { return this._value }
	get maxValue() { return this._maxValue }
	get isHuman() { return this._isHuman }
	get speaker() { return this._speaker }
	get nextTurn() { return this._nextTurn }

	set playType(value) { this._playType = value }
	set value(value) { this._value = value }
	set maxValue(value) { this._maxValue = value }
	set isHuman(value) { this._isHuman = value }
	set nextTurn(value) { this._nextTurn = value }

	isGameOver() {
		return (this._value >= this._maxValue);
	}

	incValue() {
		this._value++;
	}

	stopTurn() {
		this._nextTurn = false;
	}
}