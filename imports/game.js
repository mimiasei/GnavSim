import Speaker from './speaker.js';

export default class Game extends EventTarget {

	constructor(playType, maxValue, isHuman) {
		playType = playType || 0;
		maxValue = maxValue || 1;
		isHuman = isHuman || false;

		super();

		Game.STATE_BEFORE_SWAP = 0x01;
		Game.STATE_AFTER_SWAP = 0x02;
		
		this._playType = playType; //0 = max ROUNDS, 1 = reach SCORE
		this._turn = 1; //current turn
		this._highscore = 0;
		this._maxValue = maxValue; //value to reach, either ROUNDS or SCORE
		this._isHuman = isHuman;
		this._speaker = new Speaker(this);
		this._players = [];
		this._dealer = 0;
		this._currentPlayer = 0;
		this._state = Game.STATE_BEFORE_SWAP;

		this.initEvents();
	}

	//getters
	get playType() { return this._playType }
	get turn() { return this._turn }
	get highscore() { return this._highscore }
	get maxValue() { return this._maxValue }
	get isHuman() { return this._isHuman }
	get round() { return this._round }
	get dealer() { return this._dealer }
	get players() { return this._players }
	get state() { return this._state }

	//Special getters
	get currentPlayer() { return this._players[this._currentPlayer] }
	get currentDealer() { return this._players[this._dealer] }

	//setters
	set playType(value) { this._playType = value }
	set turn(value) { this._turn = value }
	set maxValue(value) { this._maxValue = value }
	set isHuman(value) { this._isHuman = value }
	set players(value) { this._players = Array.from(value) }
	set state(value) { this._state = value }

	initEvents() {
		this.addEventListener(
			'event_hasSwapped', 
			(event) => {
				console.log("event_hasSwapped called by player: ", this._players[event.detail.playerIndex]);
			}
		);

		this.addEventListener(
			'event_endTurn', 
			(event) => {
				console.log("event_endTurn called by player: ", this._players[event.detail.playerIndex]);
			}
		);
	}

	async gameLoop(deck, highestScorePlayers) {		
		//clear main output element
		this._speaker.clear();
		
		//refresh table of player stats
		this._speaker.refreshStatsTable(this._players);
		//print round
		this._speaker.printRound(this._value, deck.cards.length);
		this._speaker.addSpace();
	
		//Draw cards for each player
		this.dealOutCards(deck);
	
		// ********* Play round *********

		/**
		 * One round consists of these stages:
		 * 
		 * 1. set next dealer
		 * 2. deal cards
		 * 3. listen for knock event from players with the fool card
		 * 4. player has these stages:
		 * 		a. check if player wants to swap with the next player or deck (wait for event)
		 * 		b. go to next player after swapping stage is finished
		 * 
		 */

		//set next dealer
		this.nextDealer();
		//proclaim dealer
		this._speaker.say("Current dealer is: " + this._players[0].name);


		// for (const [index, player] of this._players.entries()) {
		// 	this._speaker.updateStats(player);
		// 	let withPlayer = 'deck';
		// 	if (index + 2 <= this._players.length) { //same as index + 1 <= this._players.length - 1
		// 		withPlayer = this._players[index + 1];
		// 	}
		// 	await player.wantsToSwapTest(withPlayer, deck);
		// }
		// ******** End of round ********
		
		//Calculate scores and stats
		highestScorePlayers = await sumUpGameTurn(game, deck, highestScorePlayers);
	
		if (this.isGameOver()) {
			return true; //exit loop function
		}
	
		if (this._isHuman) {
			this._speaker.hideNextTurnButton(true); //show next turn button
			this._speaker.addSpace();
		}
	
		return highestScorePlayers;
	}

	dealOutCards(deck) {
		for (const player of this._players) {

			player.drawFromDeck(deck);

			//If player receives Narren
			if (player.heldCard && player.heldCard.isFool) {
				if (player.knockOnTable()) {
					player.addToScore(1);
				}
			}
		}
	}

	nextDealer() {
		//Pop out top player as dealer and insert at end
		let oldDealer = this._players.shift(); //Pop out first player in list, to act as dealer
		this._players.push(oldDealer); //Reinsert the dealer at the end of list
	}

	isGameOver() {
		return (this._value >= this._maxValue);
	}

	setHighestScore(score) {
		this._highscore = score;
		if (this._playType > 0) {
			this._value = score;
		} 
	}

	nextTurn() {
		this._turn++;
		this._dealer++;
		//reset dealer after last player index
		if (this._dealer > this._players.length - 1) {
			this._dealer = 0;
		}
	}
}

class Dispatcher {

	constructor() {
		this._events = {};
	}

	dispatch(eventName, data) {
		// First we grab the event
		const event = this.events[eventName];
		// If the event exists then we fire it!
		if (event) {
			event.fire(data);
		}
	}

	on(eventName, callback) {
		// First we grab the event from this.events
		let event = this.events[eventName];
		// If the event does not exist then we should create it!
		if (!event) {
			event = new DispatcherEvent(eventName);
			this._events[eventName] = event;
		}
		// Now we add the callback to the event
		event.registerCallback(callback);
	}
	
	off(eventName, callback) {
	    // First get the correct event
		const event = this._events[eventName];

		// Check that the event exists and it has the callback registered
		if (event && event.callbacks.indexOf(callback) > -1) {
			// if it is registered then unregister it!
			event.unregisterCallback(callback);
			// if the event has no callbacks left, delete the event
			if (event.callbacks.length === 0) {
				delete this._events[eventName];
			}
		}
	}
}

class DispatcherEvent {

	constructor(eventName) {
		this._eventName = eventName;
		this._callbacks = [];
	}

	registerCallback(callback) {
		this.callbacks.push(callback);
	}

	unregisterCallback(callback) {
	    // Get the index of the callback in the callbacks array
		const index = this._callbacks.indexOf(callback);

		// If the callback is in the array then remove it
		if (index > -1) {
			this_callbacks.splice(index, 1);
		}
	}

	fire(data) {
		// We loop over a cloned version of the callbacks array
		// in case the original array is spliced while looping
		const callbacks = this._callbacks.slice(0);

		// loop through the callbacks and call each one
		for (const callback of callbacks) {
			callback(data);
		}
	}
}