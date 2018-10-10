
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

	// speaker.ask("Play X rounds or first to reach Score", ["x", "s"]);
	let choice = -1;
	let maxValue = 0;
	if (choice === 0) {
		maxValue = parseInt(speaker.input("Enter number of rounds to play: "));
	}
	else if (choice === 1) {
		maxValue = parseInt(speaker.input("Enter score to reach: "));
	}
	else {
		choice = 0;
		maxValue = 10;
	}
	let isHuman = false;
	if (speaker.ask("Play against computer", 0) === 0) {
		let humanName = speaker.input("Please enter your name: ");
		let human = new Human(humanName, tools.PLAYERS.length + 1, speaker);
		players.push(human);
		isHuman = true;
	}

	let game = new GnavGame(choice, maxValue, isHuman);

	// speaker.output.append(getRandomImgElem("cat closeup"));
	// speaker.output.append(getRandomImgElem("house"));
	// speaker.output.append(getRandomImgElem("horse"));
	// speaker.output.append(getRandomImgElem("pot"));
	// speaker.output.append(getRandomImgElem("fool"));
	// speaker.output.append(getRandomImgElem("cavalry"));
	// speaker.output.append(getRandomImgElem("bird"));

	tools.PLAYERS.forEach(function (name, index) {
		let newPlayer = new Player(name, index, speaker);
		//Test, make Johannes a player that never swaps with anyone nor the deck
		if (index === 2) {
			newPlayer.neverSwapsWithDeck = false;
		}
		players.push(newPlayer);
	});

	players = tools.shuffle(players);
	let deck = new Deck();
	let round = 1;
	let sortedPlayers = [];
	let highestScore = [];

	while (!game.isGameOver()) {
		speaker.say(`Round: ${round} ===> Card pile length: ${deck.cards.length} -----------------------`);
		speaker.say("Current dealer is: " + players[0].name);

		//Pop out top player as dealer and insert at end
		let oldDealer = players.shift(); //Pop out first player in list, to act as dealer
		players.push(oldDealer); //Reinsert the dealer at the end of list

		//Draw cards for each player
		for (let i = 0; i < players.length; i++) {
			players[i].drawFromDeck(deck);

			if (players[i].heldCard && players[i].heldCard.value === 4) { //If player receives Narren
				if (players[i].knockOnTable()) {
					players[i].addToScore(1);
				}
			}
		}

		console.log("playing round...");

		//Play round
		for (let i = 0; i < players.length; i++) {
			let wantsToSwap = false;
			let sayPass = players[i].sayPass();
			if (i !== players.len - 1) {
				if( players[i + 1] && players[i + 1].heldCard && players[i + 1].heldCard.value === 4) { //If the other player has Narren...
					if (!players[i].testForSwap(players[i + 1])) { //Do small chance check if player has forgotten someone knocked 3 times.
						sayPass += players[i].sayNoFool(players[i + 1]);
						console.log(players[i].sayNoFool(players[i + 1]));
					} else {
						wantsToSwap = true;
					}
				} else {
					if (!players[i].neverSwapsWithDeck && players[i].testForSwap(players[i + 1])) { //Only ask to swap if card is 4 or less.
						wantsToSwap = true;
					} else {
						if (players[i].neverSwapsWithDeck) {
							speaker.say (players[i].name + " never swaps!");
						}
					}
				}
				if (wantsToSwap) {
					if (!askPlayers(i, players[i], players, deck, speaker)) { //Check if Staa for gjok! is called.
						break;
					}
				} else {
					speaker.say (sayPass);
				}
			} else {
				if (players[i].testForSwap("deck")) { //Only swap if card is 4 or less.
					speaker.say (players[i].name + " draws from the deck.");
					players[i].drawFromDeck(deck); //Draw from deck if noone else to swap with.
				} else {
					speaker.say (sayPass);
				}
			}
		}

		speaker.addSpace();
		speaker.say ("End of round: " + round);
		speaker.addSpace();
		//End of round

		//Calculate scores and stats
		console.log("End of round: " + round);
		sortedPlayers = players.sort((a, b) => (a.heldCard.value < b.heldCard.value) ? 1 : ((a.heldCard.value > b.heldCard.value) ? -1 : 0));

		let winner = sortedPlayers[0];
		winner.wins++;

		let loser = sortedPlayers[sortedPlayers.length - 1];
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

		let mostWins = Array.from(players.sort((a, b) => (a.wins < b.wins) ? 1 : ((a.wins > b.wins) ? -1 : 0)));
		let mostLosses = Array.from(players.sort((a, b) => (a.losses < b.losses) ? 1 : ((a.losses > b.losses) ? -1 : 0)));
		highestScore = Array.from(players.sort((a, b) => (a.score < b.score) ? 1 : ((a.score > b.score) ? -1 : 0)));

		let scoreLine = "-------> Scores: "

		for (let player of players) {
			let thisPly = player.name;
			if (player.pid === highestScore[0].pid) {
				thisPly = "**" + thisPly.toUpperCase() + "**";
			}
			scoreLine += thisPly + ": " + player.score + ", ";
		}
		speaker.addSpace();
		speaker.say (scoreLine.slice(0, scoreLine.len - 2));
		speaker.say ("GAME STATS: Most wins -> " + mostWins[0].name + ": " + mostWins[0].wins + ", most losses -> " + mostLosses[0].name + ": " + mostLosses[0].losses);

		round++;

		if (game.playType === 0) {
			game.incValue();
		} else {
			speaker.say("INFO: Setting " + highestScore[0].score + " as new best score value for game.");
			game.setValue(highestScore[0].score);
		}

		speaker.addSpace();

		if (game.isHuman) {
			speaker.ask("Press ENTER to continue", -1);
			speaker.addSpace();
		}
		//else:
			//time.sleep(1)
	}
	//End of game loop while

	proclaimWinner(highestScore[0], game, round, speaker);
}

function askPlayers(nbr, player, players, deck, speaker) {
	let nextAdd = 1;
	let hasSwapped = false;
	let dragonen = false;

	while (!hasSwapped && !dragonen && (nbr + nextAdd) < players.len) {
		player.requestSwap(players[nbr + nextAdd]);
		returnedCardValue = players[nbr + nextAdd].answerSwap(player);

		if (returnedCardValue === 4) {
			speaker.say ("Everyone starts laughing and says 'Men " + players[nbr + nextAdd].name + " har jo narren!'");
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

function proclaimWinner(player, game, round, speaker) {
	speaker.addSpace();
	let text = "<<<<<<<<<<<<<<<<<< ";
	if (game.playType === 0) {
		text += `The winner of ${game.maxValue} rounds of GNAV is...`;
	} else {
		text += `The winner after ${round} rounds reaching score ${game.maxValue} is...`;
	}
	text += " >>>>>>>>>>>>>>>>>>";
	speaker.say (text);
	speaker.say ('<<' +  ' '.repeat(text.length - 4) + '>>');
	let spaces = ((text.length - 2) / 2) - (player.name.length / 2);
	speaker.say ('<<' + (' '.repeat(spaces)) + player.name + (' '.repeat(spaces - 2)) + '>>');
	speaker.say ('<<' +  ' '.repeat(text.length - 4) + '>>');
	speaker.say ('<'.repeat(text.length / 2) + '>'.repeat(text.length / 2));
}

function startGame() {
	let speaker = new Speaker();
	// let player = new Player();
	speaker.say("<<< Welcome to Gnav The Card Game >>>", "h3");
	speaker.ask("Play multiplayer game", 0);
	let choice = 1;
	if (choice == 0) {
		if (sys.argv.length !== 2) {
			// host = HOST;
			// port = PORT;
		}
		else {
			// host, port = sys.argv[1].split(":");
			// port = int(port);
		}
		speaker = gnavChat.ChatSpeaker();
		// let clientThreads = [];
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

function getRandomImgElem(search) {
	let imageUrl = 'https://source.unsplash.com/100x100/?' + search;
	return $( "<img>", { id: search + "_img", src: imageUrl, title: search } );
}

// --------------------------------------------------------------------------

$(document).ready(function() {
  startGame();
});