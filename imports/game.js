'use strict';

import Speaker from './speaker.js';
import Deck from './deck.js';
import Player from './player.js';
import Human from './human.js';
import PlayerStack from './playerstack.js';
import * as tools from './gnavtools.js';

export default class Game extends EventTarget {

	/**
	 * Has static vars:
	 * Game.STATE_START_TURN (string)
	 * Game.STATE_BEFORE_SWAP (string)
	 * Game.STATE_DECIDED_SWAP (string)
	 * Game.STATE_AFTER_SWAP (string)
	 * Game.STATE_END_TURN (string)
	 */

	constructor(playType, maxValue, isHuman) {
		playType = playType || 0;
		maxValue = maxValue || 1;
		isHuman = isHuman || false;

		super();
		
		this._playType = playType; //0 = max ROUNDS, 1 = reach SCORE
		this._turn = 0; //current turn
		this._highscore = 0;
		this._maxValue = maxValue; //value to reach, either ROUNDS or SCORE
		this._isHuman = isHuman;
		this._speaker = null;
		this._players = [];
		this._highestScorePlayers = [];
		this._dealerIndex = 0;
		// this._currPlayerIndex = 0;
		this._deck = null;
		this._state = null;
		this._playerStack = null;

		this.counter = 0;
	}

	//getters
	get playType() { return this._playType }
	get turn() { return this._turn }
	get highscore() { return this._highscore }
	get maxValue() { return this._maxValue }
	get isHuman() { return this._isHuman }
	get dealer() { return this._dealerIndex }
	get players() { return this._players }
	get state() { return this._state }
	get speaker() { return this._speaker }
	get deck() { return this._deck }
	get playerStack() { return this._playerStack }

	//Special getters
	// get currentPlayer() { return this._players[this._currPlayerIndex] }
	get currentPlayer() { return this._playerStack.current() }
	// get currentDealer() { return this._players[this._dealerIndex] }
	get currentDealer() { return this._playerStack.dealer() }

	//setters
	set playType(value) { this._playType = value }
	set turn(value) { this._turn = value }
	set maxValue(value) { this._maxValue = value }
	set isHuman(value) { this._isHuman = value }
	set players(value) { this._players = Array.from(value) }

	//state handler in the state setter
	set state(value) {
		const oldState = this._state;

		if (this._state !== value) {
			this._state = value;
			$("#prettyInfo").text('Current state: ' + this._state);
			tools.log(`STATE: ${oldState} ==> ${this._state}`);
			this.stateChanged();
		} else {
			tools.log('not changing state as new value === old value');
		}
	}

		/**
	 * A turn consists of these stages:
	 * 
	 * 1. set next dealer
	 * 2. deal cards
	 * 3. listen for knock event from players with the fool card
	 * 4. player has these stages:
	 * 		a. check if player wants to swap with the next player or deck (wait for event)
	 * 		b. go to next player after swapping stage is finished
	 * 5. end of turn, go next turn (back to 1.)
	 */
	stateChanged() {		
		// this.counter++;
		switch (this.state) {
			case (Game.STATE_START_TURN):
				this.startTurn();
				this.checkCards();
				this.state = Game.STATE_BEFORE_SWAP;
				break;
			case (Game.STATE_BEFORE_SWAP):
				this.checkCards();
				this.prepareSwap();
				break;
			case (Game.STATE_DECIDED_SWAP): //after callback from deciding YES for swapping
				this.checkCards();
				this.finalizeSwap(true);
				break;
			case (Game.STATE_SKIPPED_SWAP): //after callback from deciding NO for swapping
				this.checkCards();
				this.finalizeSwap(false);
				break;
			case (Game.STATE_AFTER_SWAP):
				this.checkCards();
				this.nextPlayer();
				break;
			case (Game.STATE_END_TURN):
				//show next turn button
				this.checkCards();
				this._speaker.hideNextTurnButton(true);
				this._speaker.addSpace();
				//Calculate scores and stats
				this._speaker.sumUpGameTurn().then(() => { tools.log('turn summed up.') });
				this.nextTurn();
				tools.log('turn ended successfully.');
				break;
		}

		return true;
		// tools.log(`statechanged counter: ${this.counter}, current turn: ${this._turn}`);
	}

	//DEBUG!
	checkCards() {
		this._players.forEach(player => {
			if (!player.heldCard) {
				tools.log(`${player.name} doesn't have valid card!`);
				console.log(player.heldCard);
			}
		});
	}

	prepareSwap() {
		const nextPlayer = this._playerStack.nextTo();
		this.currentPlayer.testForSwap(nextPlayer);
	}

	finalizeSwap(result) {
		if (result) {
			const nextPlayer = this._playerStack.nextTo();
			this._speaker.say(`${this.currentPlayer.name} swaps with ${nextPlayer.name}`);
			this.currentPlayer.cardSwap(nextPlayer);
		} else {
			this._speaker.say(`${this.currentPlayer.name} doesn't want to swap.`);
		}

		// this.currentPlayer.wantsToSwapTest(withPlayer);
		this.state = Game.STATE_AFTER_SWAP;
	}

	async init() {
		
		//function for when next turn button is clicked
		const nextTurnCallback = (async (result) => {			
			// First create the event
			const event = new CustomEvent('event_endTurn', {
				detail: {
					player: this.currentPlayer
				}
			});
			
			// Trigger it!
			this.dispatchEvent(event);
			
			this.nextTurn = result;
			this.speaker.hideNextTurnButton();
		});
		
		//function for when knock button is clicked
		let knockCallback = (async (result) => {
			// First create the event
			const event = new CustomEvent('event_knock', {
				detail: {
					player: this.currentPlayer
				}
			});
			// Trigger it!
			this.dispatchEvent(event);

			tools.log("knocking: ", result);
		});
		
		//create new speaker
		this._speaker = new Speaker(this);
		//initialize, assign callback functions to speaker
		this._speaker.initialize(nextTurnCallback, knockCallback);

		//create and init new deck
		this._deck = new Deck();
		await this._deck.init();

		//set players as best and second best score
		this._highestScorePlayers = [this._players[0], this._players[1]]; 

		//create events
		this._event_beforeSwap = new CustomEvent('event_beforeSwap', {
			// detail: {
			// 	player: this.currentPlayer
			// }
		});

		this._event_decidedSwap = new CustomEvent('event_decidedSwap', {
			// detail: {
			// 	player: this.currentPlayer,
			// 	result: false
			// }
		});

		this._event_afterSwap = new CustomEvent('event_afterSwap', {
			// detail: {
			// 	player: this.currentPlayer
			// }
		});

		this._event_endTurn = new CustomEvent('event_endTurn', {
			// detail: {
			// 	player: this.currentPlayer
			// }
		});

		//create event listeners
		this.addEventListener(
			'event_knock', 
			(event) => {
				console.log("event_knock called by player: ", event.detail.player);

				this.tableKnocked();
			}
		);

		this.addEventListener(
			'event_beforeSwap', 
			(event) => {
				console.log("event_beforeSwap called by player: ", event.detail.player);
				this.state = Game.STATE_BEFORE_SWAP;
			}
		);

		this.addEventListener(
			'event_decidedSwap', 
			(event) => {
				console.log("event_decidedSwap called by player: ", event.detail.player);
				this.state = Game.STATE_DECIDED_SWAP;
			}
		);
		
		this.addEventListener(
			'event_afterSwap', 
			(event) => {
				console.log("event_afterSwap called by player: ", event.detail.player);
				this.state = Game.STATE_AFTER_SWAP;
			}
		);

		this.addEventListener(
			'event_endTurn', 
			(event) => {
				console.log("event_endTurn called by player: ", event.detail.player);
				this.state = Game.STATE_END_TURN;
			}
		);
	}

	async initGame() {
		tools.log('starting initgame...');
		//show knock button
		this._speaker.hideKnockButton(true);

		if (this._isHuman && this._speaker.humanName) {
			let human = new Human(this._speaker.humanName, this);
			this._players.push(human);
		}

		for (const name of tools.PLAYERS) {
			let newPlayer = new Player(name, this);
			//Test, make Johannes a player that never swaps with anyone nor the deck
			if (name === 'Johannes') {
				newPlayer.neverSwapsWithDeck = true;
			}
			this._players.push(newPlayer);
		}

		let playersPromise = tools.shuffle(this._players);
		//wait for shuffle to finish
		this._players = await playersPromise;
		//create player stack for handling players in game turn.
		this._playerStack = new PlayerStack(this._players);
		//redraw stats table
		this._speaker.refreshStatsTable();
		
		//set first turn
		await this.nextTurn();

		tools.log('initgame done.');
	}

	nextTurn() {
		this._turn++;

		//set next dealer
		this._playerStack.nextDealer();
		this._speaker.say(`Current dealer is: ${this._players[0].name}`);

		this.state = Game.STATE_START_TURN;

		return true;
	}

	startTurn() {
		//clear main output elementæ
		this._speaker.clear();

		//refresh table of player stats
		this._speaker.refreshStatsTable(this._players);

		//print round
		this._speaker.printRound();
		this._speaker.addSpace();
	
		//set next dealer
		// this.nextDealer();

		//Draw cards for each player
		this.dealOutCards();
	}

	dealOutCards() {
		for (const player of this._players) {
			player.drawFromDeck(this._deck);

			//If player receives Narren
			if (player.heldCard && player.heldCard.isFool) {
				if (player.knockOnTable()) { //todo: this doesn't work yet with Human player
					player.addToScore(1);
				}
			}
		}
	}

	nextPlayer() {
		const oldPlayer = this.currentPlayer.name;

		if (!this._playerStack.next()) {
			this.state = Game.STATE_END_TURN;
		} else {
			tools.log(`!! nextplayer from: ${oldPlayer} to: ${this.currentPlayer.name}`);
			
			this.state = Game.STATE_BEFORE_SWAP;
		}
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

	/**
	 * Returns player with highest score
	 */
	async findWinner() {
		tools.log('players:');
		console.log(this._players);
		const maxVal = await tools.extreme(this._players, 'heldCard.value'); //maxval is default when not passing 3rd param
		let winner = this._players[maxVal.mostIndex];
		winner.hasHighscore = true;
		return winner;
	}

	/**
	 * Returns player with lowest score
	 */
	async findLoser() {
		tools.log('players:');
		console.log(this._players);
		const minVal = await tools.extreme(this._players, 'heldCard.value', true); //tools.FIND_MIN === true
		return this._players[minVal.mostIndex];
	}

	getMinY() {
		return data.reduce((min, p) => p.y < min ? p.y : min, data[0].y);
	}

	getMaxY() {
		return data.reduce((max, p) => p.y > max ? p.y : max, data[0].y);
	}

	subractFromAllPlayers(players) {
		for (let player of players) {
			if (player.pid !== this.currentPlayer.pid) { //Subtract 1 score one from all players except current
				player.addToScore(-1);
			}
		}
	}

	tableKnocked() {
		this.currentPlayer.knockOnTable();
		//If player has Narren
		if (this.currentPlayer.isFool) {
			player.addToScore(1);
		} else {
			this._speaker.say(`${this.currentPlayer.name} knocked on the table for no apparent reason.`);
		}
	}
}