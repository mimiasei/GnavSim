'use strict';

import Speaker from './speaker.js';
import Deck from './deck.js';
import Player from './player.js';
import Human from './human.js';
import PlayerStack from './playerstack.js';
import * as tools from './gnavtools.js';
import Gui from './gui.js';

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
		this._dealerIndex = 0;
		this._deck = null;
		this._state = null;
		this._playerStack = null;
		this._gui = null;
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
	get gui() { return this._gui }

	//Special getters
	get currentPlayer() { return this._playerStack.current() }
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
			tools.log(`STATE: ${oldState} ==> ${this._state}`, this);
			this.stateChanged();
		} else {
			tools.log('not changing state as new value === old value', this);
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
		switch (this.state) {
			case (Game.STATE_START_TURN):
				this.startTurn();
				// this.checkCards();
				// this.state = Game.STATE_BEFORE_SWAP;
				this.startEvent('beforeSwap');	
				break;
			case (Game.STATE_BEFORE_SWAP):
				// this.checkCards();
				this.currentPlayer.prepareSwap();
				break;
			case (Game.STATE_DECIDED_SWAP): //after callback from deciding YES for swapping
				// this.checkCards();
				this.currentPlayer.finalizeSwap(true);
				break;
			case (Game.STATE_SKIPPED_SWAP): //after callback from deciding NO for swapping
				// this.checkCards();
				this.currentPlayer.finalizeSwap(false);
				break;
			case (Game.STATE_AFTER_SWAP):
				this.checkCards();
				// this.nextPlayer();
				this.startEvent('endPlayer');
				break;
			case (Game.STATE_END_PLAYER):
				// this.checkCards();
				//show next player button
				this._speaker.hideButton('player', true);
				this._speaker.addSpace();
				tools.log('player turn ended successfully.', this);
				break;
			case (Game.STATE_END_TURN):
				// this.checkCards();
				//show next turn button
				this._speaker.hideButton('turn', true);
				this._speaker.addSpace();
				//Calculate scores and stats
				this._speaker.sumUpGameTurn();
				tools.log('turn ended successfully.', this);
				break;
		}

		return true;
	}

	//DEBUG!
	checkCards() {
		this._players.forEach(player => {
			if (!player.heldCard) {
				tools.log(`${player.name} doesn't have valid card!`, this);
				console.log(player.heldCard);
			}
		});
	}

	async init() {
		
		//function for when next turn button is clicked
		const nextTurnCallback = (result) => {			
			this.startEvent('startTurn');	
			this._speaker.hideButton('turn');
		};

		//function for when next player button is clicked
		const nextPlayerCallback = (result) => {			
			this._speaker.hideButton('player');
			
			if (!this._playerStack.hasNext()) {
				this.startEvent('endTurn');
			} else {
				this.nextPlayer();
			}
		}
		
		//function for when knock button is clicked
		let knockCallback = (result) => {
			// const event = new CustomEvent('event_knock', {
			// 	detail: {
			// 		player: this.currentPlayer
			// 	},
			// 	bubbles: true,
			// });

			// this.dispatchEvent(event);

			this.startEvent('knock');
		};
		
		//create new speaker
		this._speaker = new Speaker(this);
		//initialize, assign callback functions to speaker
		const callbacks = {
			'nextTurnCallback': nextTurnCallback,
			'nextPlayerCallback': nextPlayerCallback,
			'knockCallback': knockCallback,
		};
		this._speaker.initialize(callbacks);

		//create and init new deck
		this._deck = new Deck();
		await this._deck.init();

		//create event listeners
		this.addEventListener(
			'event_knock', 
			(event) => {
				console.log("event_knock called by player: ", event.detail.player);
				this.tableKnocked();
			}
		);

		this.addEventListener(
			'event_startTurn', 
			(event) => {
				console.log("event_startTurn called by player: ", event.detail.player);
				this.state = Game.STATE_START_TURN;
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
			'event_skippedSwap', 
			(event) => {
				console.log("event_skippedSwap called by player: ", event.detail.player);
				this.state = Game.STATE_SKIPPED_SWAP;
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
			'event_endPlayer', 
			(event) => {
				console.log("event_endPlayer called by player: ", event.detail.player);
				this.state = Game.STATE_END_PLAYER;
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

	/**
	 * event names: 
	 * startTurn, beforeSwap, decidedSwap, skippedSwap, afterSwap, endPlayer, endTurn
	 */
	startEvent(event) {
		tools.log(event);

		const stack = new Error().stack;
		const caller = stack.split('\n')[2].trim().replace('http://localhost:8000/imports/', '');
		
		let newEvent = new CustomEvent(`event_${event}`, { detail: { player: `${this.currentPlayer.name}:${caller}`, }, bubbles: true });
		this.dispatchEvent(newEvent);
	}

	async initGame() {
		tools.log('starting initgame...');
		//show knock button
		this._speaker.hideButton('knock', true);

		if (this._isHuman && this._speaker.humanName) {
			let human = new Human(this._speaker.humanName, this);
			this._players.push(human);
		}

		for (const name of tools.PLAYERS) {
			let newPlayer = new Player(name, this);
			//Test, make Johannes a player that never swaps with anyone nor the deck
			// if (name === 'Johannes') {
			// 	newPlayer.neverSwapsWithDeck = true;
			// }
			this._players.push(newPlayer);
		}

		let playersPromise = tools.shuffle(this._players);
		//wait for shuffle to finish
		this._players = await playersPromise;
		//create player stack for handling players in game turn.
		this._playerStack = new PlayerStack(this._players);
		//redraw stats table
		this._speaker.refreshStatsTable();

		//create GUI
		this._gui = new Gui(this);

		//draw gui stuff
		this._gui.drawGroup();
		// this.nextPlayer(true);
		this._gui.selectPlayer(this.currentPlayer.name);
		this._gui.displayCard();
		// this._gui.play();
		this._gui.update();
		
		//set first turn
		this.nextTurn();

		tools.log('initgame done.', this);
	}

	nextTurn() {
		this._turn++;

		//set next dealer
		this._playerStack.nextDealer();
		
		// this.state = Game.STATE_START_TURN;
		this.startEvent('startTurn');
		
		return true;
	}

	nextPlayer(skipNext) {
		skipNext = skipNext || false;

		const oldPlayer = this.currentPlayer.name;

		tools.log(`!! nextplayer from: ${oldPlayer} to: ${this.currentPlayer.name}`, this);

		//advance player stack one player 
		if (!skipNext) {
			this._playerStack.next();
		}

		this._speaker.refreshStatsTable();
		this._speaker.updateCurrentPlayer();
		this._gui.selectPlayer(this.currentPlayer.name);
		this._gui.displayCard();
		// this._gui.play();
		this._gui.update();
		
		// this.state = Game.STATE_BEFORE_SWAP;
		console.log('starting event beforeswap @nextPlayer()...');
		this.startEvent('beforeSwap');
	}
	
	startTurn() {
		//clear main output elements
		this._speaker.clear();
		
		//refresh table of player stats
		this._speaker.refreshStatsTable();
		
		//print round
		this._speaker.printRound();
		this._speaker.addSpace();
		this._speaker.say(`Current dealer is: ${this._playerStack.dealer().name}`);
	
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

	getPlayerNextTo(usePos) {
		return this._playerStack.nextTo(usePos);
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
	findWinner() {
		// const maxVal = await tools.extreme(this._players, 'heldCard.value'); //maxval is default when not passing 3rd param
		const winner = tools.getExtreme(this._players, 'heldCard.value', true); //true means get max value
		winner.hasHighscore = true;
		return winner;
	}

	/**
	 * Returns player with lowest score
	 */
	findLoser() {
		// const minVal = await tools.extreme(this._players, 'heldCard.value', true); //tools.FIND_MIN === true
		const loser = tools.getExtreme(this._players, 'heldCard.value', false); //false means get min value
		return loser;
	}

	subractFromAllPlayers(cardHolder) {
		this._speaker.say(`All players lose 1 score except ${cardHolder.name}.`);

		for (const player of this._players) {
			if (player.pid !== cardHolder.pid) { //Subtract 1 score one from all players except the card holder
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