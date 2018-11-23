import Speaker from './speaker.js';

export default class Game {

	constructor(playType, maxValue, isHuman) {
		playType = playType || 0;
		maxValue = maxValue || 1;
		isHuman = isHuman || false;
		
		this._playType = playType; //0 = max ROUNDS, 1 = reach SCORE
		this._value = 1; //current value, either ROUND or highest SCORE
		this._highscore = 0;
		this._maxValue = maxValue; //value to reach, either ROUNDS or SCORE
		this._isHuman = isHuman;
		this._speaker = new Speaker(this);
		this._dealer = 0;
		this._players = [];
	}

	get playType() { return this._playType }
	get value() { return this._value }
	get highscore() { return this._highscore }
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

	async gameLoop(deck, highestScorePlayers) {		
		//clear main output element
		this._speaker.clear();
		
		//refresh table of player stats
		this._speaker.refreshStatsTable(this._players);
		//print round
		this._speaker.printRound(this._value, deck.cards.length);
		this._speaker.addSpace();
	
		//set next dealer
		this.nextDealer();
		//proclaim dealer
		this._speaker.say("Current dealer is: " + this._players[0].name);
	
		//Draw cards for each player
		this.dealOutCards(deck);
	
		// ********* Play round *********
		for (const [index, player] of this._players.entries()) {
			this._speaker.updateStats(player);
			let withPlayer = 'deck';
			if (index + 2 <= this._players.length) { //same as index + 1 <= this._players.length - 1
				withPlayer = this._players[index + 1];
			}
			await player.wantsToSwapTest(withPlayer, deck);
		}
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