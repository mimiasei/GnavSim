
// import * as gnavtools from 'gnavtools';

const PLAYERS = ["Kristoffer", "Matias", "Johannes", "Miriam", "Mikkel", "Emil", "Oivind", "Ask"];
const MAX_ROUNDS = 1;
const SWAP_THRESHOLDNUMBER = 4;
const SWAP_FUZZINESS = 0.03; //Simulates human error. 0.1 = 10% chance of making a mistake.

const TXT_WANT_TO_SWAP = "Jeg vil gjerne bytte med deg.";
const TXT_ACCEPT_SWAP = "Jada, her er kortet mitt.";
const TXT_KNOCK = " banker tre ganger på bordet. <BANK, BANK, BANK>";
const TXT_PASSES = " sier 'Jeg står.'";
const TXT_NO_WAY_FOOL = " and thinks ''Aldri i livet, %s har jo narren!''";

// Multiplayer stuff -----------------
const HOST = "localhost";
const PORT = 112;

import Player from '/imports/player.js';
import Human from './imports/human.js';

import Card from './imports/card.js';		
import Deck from './imports/deck.js';		
import Cuckoo from './imports/cuckoo.js';		
import Dragoon from './imports/dragoon.js';		
import Cat from './imports/cat.js';		
import Horse from './imports/horse.js';		
import House from './imports/house.js';		
import Fool from './imports/fool.js';	

import Speaker from './imports/speaker.js';

import * as tools from './imports/gnavtools.js';

class GnavGame {

	constructor(playType, maxValue, isHuman) {
		this.playType = playType; //0 = max rounds, 1 = reach score
		this.value = 0; //current value, either round or highest score
		this.maxValue = maxValue; //value to reach, either rounds or score
		this.isHuman = isHuman;
	}

	isGameOver() {
		return (this.value >= this.maxValue);
	}

	incValue() {
		this.value++;
	}

	setValue(value) {
		this.value = value;
	}
}

// ------------- End of classes ---------------		

function playGame(speaker) {
	//max_rounds = MAX_ROUNDS
	let players = [];

	speaker.ask("Play X rounds or first to reach Score", ["x", "s"]);
	let choice = 0;
	let maxValue = 0;
	if (choice === 0) {
		maxValue = parseInt(speaker.input("Enter number of rounds to play: "));
	}
	else if (choice === 1) {
		maxValue = parseInt(speaker.input("Enter score to reach: "));
	}
	else {
		choice = 0;
		maxValue = 5;
	}
	let isHuman = false;
	if (speaker.ask("Play against computer", 0) === 0) {
		let humanName = input("Please enter your name: ");
		human = new Human(humanName, len(PLAYERS) + 1, speaker);
		players.push(human);
		isHuman = true;
	}

	let game = new GnavGame(choice, maxValue, isHuman);

	PLAYERS.forEach(function (name, index) {
		let newPlayer = new Player(name, index, speaker);
		//Test, make Johannes a player that never swaps with anyone nor the deck
		if (index === 2) {
			newPlayer.neverSwapsWithDeck = true;
		}
		players.push(newPlayer);
	});

	players = tools.shuffle(players);
	let deck = new Deck();
				console.log(deck);
	let round = 1;

	while (!game.isGameOver()) {
		speaker.say("Round: ${round} ===> Card pile length: ${deck.cards.length} -----------------------");
		speaker.say("Current dealer is: " + players[0].name);

		//Pop out top player as dealer and insert at end
		let oldDealer = players.shift(); //Pop out first player in list, to act as dealer
		players.push(oldDealer); //Reinsert the dealer at the end of list

		//Draw cards for each player
		for (let player of players) {
			player.drawFromDeck(deck);
			if (player.heldCard.value === 4) { //If player receives Narren
				if (player.knockOnTable()) {
					player.addToScore(1);
				}
			}
		}

		//Play round
		players.forEach(function (name, index) {
			let wantsToSwap = false;
			let sayPass = player.sayPass();
			if (nbr !== len(players) - 1) {
				if( players[nbr + 1].heldCard.value === 4) { //If the other player has Narren...
					if (!player.testForSwap(players[nbr + 1])) { //Do small chance check if player has forgotten someone knocked 3 times.
						sayPass += player.sayNoFool(players[nbr + 1]);
					} else {
						wantsToSwap = true;
					}
				} else {
					if (!player.neverSwapsWithDeck && player.testForSwap(players[nbr + 1])) { //Only ask to swap if card is 4 or less.
						wantsToSwap = true;
					} else {
						if (player.neverSwapsWithDeck) {
							speaker.say (player.name + " never swaps!");
						}
					}
				}
				if (wantsToSwap) {
					if (!askPlayers(nbr, player, players, deck)) { //Check if Staa for gjok! is called.
						break;
					}
				} else {
					speaker.say (sayPass);
				}
			} else {
				if (player.testForSwap("deck")) { //Only swap if card is 4 or less.
					speaker.say (player.name + " draws from the deck.");
					player.drawFromDeck(deck); //Draw from deck if noone else to swap with.
				} else {
					speaker.say (sayPass);
				}
			}
		});

		speaker.say ("End of round " + str(round) + " ======================================");
		//End of round

		//Calculate scores and stats
		sortedPlayers = players.sort((a, b) => a.heldCard.value > b.heldCard.value);
		winner = sortedPlayers[0];
		winner.wins++;
		loser = sortedPlayers[len(sortedPlayers) - 1];
		loser.losses++;
		speaker.say ("Winner of this round is " + winner.name + " with the card " + winner.heldCard.name);
		winner.addToScore(1);
		speaker.say ("Loser of this round is " + loser.name + " with the card " + loser.heldCard.name);
		loser.addToScore(-1);
		//Search for Narren among players
		for (let player of players) {
			if (player.heldCard.value === 4) {
				speaker.say ("Unfortunately, " + player.name + "'s card at end of round is Narren.");
				player.addToScore(-1);
			}
		}

		//All players toss their cards in the discard pile
		for (let player of players) {
			player.discard(deck);
		}

		deck.testLengthSum();

		mostWins = players.sort((a, b) => a.wins > b.wins);
		mostWins = players.sort((a, b) => a.losses > b.losses);
		mostWins = players.sort((a, b) => a.score > b.score);

		scoreLine = "-------> Scores: "

		for (let player of players) {
			let thisPly = player.name;
			if (player.pid == highestScore[0].pid) {
				thisPly = "**" + thisPly.upper() + "**";
			}
			scoreLine += thisPly + ": " + str(player.score) + ", ";
		}
		speaker.say ("");
		speaker.say (scoreLine.slice(0, scoreLine.len - 2));
		speaker.say ("GAME STATS: Most wins -> " + mostWins[0].name + ": " + str(mostWins[0].wins) + ", most losses -> " + mostLosses[0].name + ": " + str(mostLosses[0].losses));

		round++;

		if (game.playType === 0) {
			game.incValue();
		} else {
			speaker.say("INFO: Setting " + str(highestScore[0].score) + " as new best score value for game.");
			game.setValue(highestScore[0].score);
		}

		speaker.say ("");

		if (game.isHuman) {
			speaker.ask("Press ENTER to continue", -1);
			speaker.say ("");
		}
		//else:
			//time.sleep(1)
	}
	//End of game loop while

	proclaimWinner(highestScore[0], game, round);
}

function askPlayers(nbr, player, players, deck) {
	let nextAdd = 1;
	let hasSwapped = false;
	let dragonen = false;

	while (!hasSwapped && !dragonen && (nbr + nextAdd) < players.len) {
		//speaker.say ("%s is now about to ask the next player, %s, if he wants to swap..." % (player.name, players[nbr + nextAdd].name))
		player.requestSwap(players[nbr + nextAdd]);
		returnedCardValue = players[nbr + nextAdd].answerSwap(player);
		if (returnedCardValue === 4) {
			speaker.say (":-) Everybody starts laughing and says 'Men " + players[nbr + nextAdd].name + " har jo narren!'");
		}

		result = player.processAnswer(returnedCardValue);
		if (result === 1) { //Hesten or huset
			nextAdd++;
		} else if (result === 2) { //katten
			player.addToScore(-1);
			nextAdd++;
		} else if (result === 3) { //dragonen
			dragonen = true;
			player.addToScore(-1);
		} else if (result === 4) { //gjoeken
			subractFromAllPlayers(players[nbr + nextAdd], players);
			return false;
		} else { //The two players Swap cards
			player.swapWithPlayer(players[nbr + nextAdd]);
			hasSwapped = true;
		}

		if (!hasSwapped) { //If player still hasn't swapped after being last in round
			speaker.say (player.name + " draws from the deck.");
			player.drawFromDeck(deck);
		}
	}
	return true;
}

function subractFromAllPlayers(player, players) {
	for (let ply of players) {
		if (ply.pid !== player.pid) { //Subtract 1 score one from all players except current
			ply.addToScore(-1);
		}
	}
}

function proclaimWinner(player, game, round) {
	speaker.say ("");
	let text = "<<<<<<<<<<<<<<<<<< ";
	if (game.playType === 0) {
		text += "The winner of ${game.maxValue} rounds of GNAV is...";
	} else {
		text += "The winner after ${round} rounds reaching score ${game.maxValue} is...";
	}
	text += " >>>>>>>>>>>>>>>>>>";
	speaker.say (text);
	speaker.say ("<<" + (text.len - 4) * " " + ">>");
	spaces = ((text.len - 2) / 2) - (player.name.len / 2);
	speaker.say ("<<" + (" " * spaces) + player.name + (" " * (spaces - 2)) + ">>");
	speaker.say ("<<" + (text.len - 4) * " " + ">>");
	speaker.say ("<" * (text.len / 2) + ">" * (text.len) / 2);
}

// --------------------------------------------------------------------------

$(document).ready(function() {
  startGame();
});

function startGame() {
	let speaker = new Speaker();
	let player = new Player();
	speaker.say("<<< Welcome to Gnav The Card Game >>>");
	speaker.ask("Play multiplayer game", 0);
	let choice = 1;
	if (choice == 0) {
		if (sys.argv.len !== 2) {
			// host = HOST;
			// port = PORT;
		}
		else {
			// host, port = sys.argv[1].split(":");
			// port = int(port);
		}
		speaker = gnavChat.ChatSpeaker();
		let clientThreads = [];
		let choice = 0;
		while (choice === 0) {
			// networkClient = gnavChat.NetworkClient(speaker, host, port)
			// clientThread = threading.Thread(target = networkClient.loop)
			// clientThreads.append(clientThread)
			// console.log ("Client thread %d added to list." % len(clientThreads))
			// choice = ask("Create new client", 0);
		}
		// console.log("Starting all %d threads..." % len(clientThreads))
		// for (thread in clientThreads) {
		// 	thread.start();
		// }
	}
	else {
		playGame(speaker);
	}

}