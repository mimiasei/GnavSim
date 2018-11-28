import Speaker from './speaker.js';

export default class Game extends EventTarget {

	constructor(playType, maxValue, isHuman) {
		playType = playType || 0;
		maxValue = maxValue || 1;
		isHuman = isHuman || false;

		super();

		Game.STATE_START_TURN = 'state_startTurn';
		Game.STATE_BEFORE_SWAP = 'state_beforeSwap';
		Game.STATE_AFTER_SWAP = 'state_afterSwap';
		Game.STATE_END_TURN = 'state_endTurn';
		
		this._playType = playType; //0 = max ROUNDS, 1 = reach SCORE
		this._turn = 1; //current turn
		this._highscore = 0;
		this._maxValue = maxValue; //value to reach, either ROUNDS or SCORE
		this._isHuman = isHuman;
		this._speaker = null;
		this._players = [];
		this._dealerIndex = 0;
		this._currPlayerIndex = 0;
		this._state = Game.STATE_BEFORE_SWAP;
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

	//Special getters
	get currentPlayer() { return this._players[this._currPlayerIndex] }
	get currentDealer() { return this._players[this._dealerIndex] }

	//setters
	set playType(value) { this._playType = value }
	set turn(value) { this._turn = value }
	set maxValue(value) { this._maxValue = value }
	set isHuman(value) { this._isHuman = value }
	set players(value) { this._players = Array.from(value) }
	set state(value) { this._state = value }

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
			// highestScorePlayers = await gameLoop(game, deck, highestScorePlayers);
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

			console.log("knocking: ", result);
		});
		
		//assign callback functions to speaker
		this._speaker = new Speaker(this);
		this._speaker.initialize(nextTurnCallback, knockCallback);

		//create events
		this._event_beforeSwap = new CustomEvent('event_beforeSwap', {
			detail: {
				player: this.currentPlayer
			}
		});

		this._event_endTurn = new CustomEvent('event_endTurn', {
			detail: {
				player: this.currentPlayer
			}
		});

		//create event listeners
		this.addEventListener(
			'event_knock', 
			(event) => {
				console.log("event_knock called by player: ", event.detail.player);
			}
		);
		
		this.addEventListener(
			'event_hasSwapped', 
			(event) => {
				this._state = Game.STATE_AFTER_SWAP;
				console.log("event_hasSwapped called by player: ", event.detail.player);
			}
		);

		this.addEventListener(
			'event_endTurn', 
			(event) => {
				console.log("event_endTurn called by player: ", event.detail.player);
			}
		);
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
	async gameLoop(deck, highestScorePlayers) {		
	
		//main game loop until someone wins
		while(!this.isGameOver()) {
			switch (this._state) {
				case (Game.STATE_START_TURN):
					this.startTurn();
					break;
				case (Game.STATE_BEFORE_SWAP):
					break;
				case (Game.STATE_AFTER_SWAP):
					this.nextPlayer();
					break;
				case (Game.STATE_END_TURN):
					if (this._isHuman) {
						this._speaker.hideNextTurnButton(true); //show next turn button
						this._speaker.addSpace();
					}
					this.nextTurn();
					break;
			}
		}
		
		//Calculate scores and stats
		highestScorePlayers = await this._speaker.sumUpGameTurn(deck, highestScorePlayers);
	
		return highestScorePlayers;

		// for (const [index, player] of this._players.entries()) {
		// 	this._speaker.updateStats(player);
		// 	let withPlayer = 'deck';
		// 	if (index + 2 <= this._players.length) { //same as index + 1 <= this._players.length - 1
		// 		withPlayer = this._players[index + 1];
		// 	}
		// 	await player.wantsToSwapTest(withPlayer, deck);
		// }
	}

	startTurn() {
		//clear main output element
		this._speaker.clear();

		//refresh table of player stats
		this._speaker.refreshStatsTable(this._players);
		//print round
		this._speaker.printRound(this._value, deck.cards.length);
		this._speaker.addSpace();
	
		//set next dealer
		this.nextDealer();

		//Draw cards for each player
		this.dealOutCards(deck);

		//call event that turn start is done and we want next state
		this.dispatchEvent(this.event_beforeSwap);
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
		// let oldDealer = this._players.shift(); //Pop out first player in list, to act as dealer
		// this._players.push(oldDealer); //Reinsert the dealer at the end of list



		//proclaim dealer
		this._speaker.say("Current dealer is: " + this._players[0].name);
	}

	nextPlayer() {
		this._currPlayerIndex++;
		
		if (this._currPlayerIndex > this._dealerIndex - 1) {
			this.dispatchEvent(this._event_endTurn);
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

	nextTurn() {
		this._turn++;
		this._dealerIndex++;
		//reset dealer after last player index
		if (this._dealerIndex > this._players.length - 1) {
			this._dealerIndex = 0;
		}
		this._currPlayerIndex = this._dealerIndex + 1;
	}
}