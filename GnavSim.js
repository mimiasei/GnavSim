
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

class Player {

	constructor(name, pid, speaker) {
		this.name = name;
		this.pid = pid;
		this.speaker = speaker;
		this.score = 5;
		this.heldCard = null;
		this.wins = 0;
		this.losses = 0;
		this.neverSwapsWithDeck = false;
	}

	setHeldCard(card, silent = false) {
		this.heldCard = card;
		//if not silent: speaker.say ("INFO: " + this.name + " now has: " + this.heldCard.name)
	}

	drawFromDeck(deck) {
		this.discard(deck);
		this.setHeldCard(deck.draw());
	}

	discard(deck) {
		if (this.heldCard !== null) {
			deck.discard(this.heldCard);
		}
		this.heldCard = null;
	}
	
	requestSwap(toPlayer) {
		speaker.say (this.sayTo(toPlayer, 0) + quote(this.TXT_WANT_TO_SWAP));
	}

	answerSwap(fromPlayer) {
		let val = this.heldCard.value;
		if (val <= 16) {
			speaker.say (this.sayTo(fromPlayer, 1) + quote(this.TXT_ACCEPT_SWAP));
		}
		else {
			let reply = val < 21 ? Card.statements[val] : Card.statements[val].upper();
			speaker.say (this.sayTo(fromPlayer, 1) + quote(reply));
		}
		return val;
	}

	swapWithPlayer(fromPlayer) {
		speaker.say ("INFO: ${this.name} swaps cards with ${fromPlayer.name}.");
		let card = this.heldCard;
		this.setHeldCard(fromPlayer.heldCard);
		fromPlayer.setHeldCard(card);
	}

	processAnswer(returnedCardValue) {
		if (returnedCardValue > 16) { //If one of the matador cards (better than (12))
			if (returnedCardValue == 17 || returnedCardValue == 18) { //huset, hesten
				return 1; //must ask next player.
			} else if (returnedCardValue == 19) { //katten
				return 2; //Loses 1 score and must ask next player.
			} else if (returnedCardValue == 20) { //dragonen
				return 3; //Loses 1 score.
			} else if (returnedCardValue == 21) { //gjoeken
				return 4; //Turn is over for all players.
			}
		} else {
			return 0; //Nothing happens.
		}
	}

	addToScore(value) {
		this.score += value;
		let verb = value > 0 ? "added" : "subtracted";
		let prepos = value > 0 ? "to" : "from";
		speaker.say ("${this.name} ${verb} ${Math.abs(value)} ${prepos} score.");
	}

	sayTo(toPlayer, typ) {
		let verb = typ == 0 ? ' asks ' : ' answers ';
		return this.name + verb + toPlayer.name + ": ";
	}

	sayPass() {
		return this.name + this.TXT_PASSES
	}

	sayNoFool(player) {
		return this.TXT_NO_WAY_FOOL % (player.name)
	}

	knockOnTable() {
		speaker.say (this.name + this.TXT_KNOCK)
		return true
	}

	testForSwap(toPlayer = null) {
		let value = this.heldCard.value;
		let swap = SWAP_THRESHOLDNUMBER + 4;
		let chance = Math.random();
		if (chance < SWAP_FUZZINESS) {
			swap--;
		} else if (chance > 1 - SWAP_FUZZINESS) {
			swap++;
		}

		if (value > swap) {
			return false; //Player doesn't want to swap and will say pass.
		} else {
			return true; //Player wants to swap.
		}
	}
}

class Card {
	
	constructor (name, value) {
		this.name = name;
		this.value = value;

		this.types = {
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

		this.statements = {
			21: 'Stå for gjøk!',
			20: 'Hogg av!',
			19: 'Kiss!',
			18: 'Hest forbi!',
			17: 'Hus forbi!'
		}

		this.name = "";
		this.value = 0;
		this.statement = "";
		this.isMatador = false;
		this.causeNoMoreSwap = false;
		this.causeLosePoint = false;
		this.causeAllLosePointAndStopGame = false;
		this.isFool = false;
	}
}

class Cuckoo extends Card {
	constructor() {
		this.name = "Gjøken";
		this.value = 21;
		this.statement = "Stå for gjøk!";
		this.isMatador = true;
		this.causeAllLosePointAndStopGame = true;
	}
}

class Dragoon extends Card {
	constructor() {
		this.name = "Dragonen";
		this.value = 20;
		this.statement = "Hogg av!";
		this.isMatador = true;
		this.causeNoMoreSwap = true;
		this.causeLosePoint = true;
	}
}

class Cat extends Card {
	constructor() {
		this.name = "Katten";
		this.value = 19;
		this.statement = "Kiss!";
		this.isMatador = true;
		this.causeLosePoint = true;
	}
}

class Horse extends Card {
	constructor() {
		this.name = "Hesten";
		this.value = 18;
		this.statement = "Hest forbi!";
		this.isMatador = true;
	}
}

class House extends Card {
	constructor() {
		this.name = "Huset";
		this.value = 17;
		this.statement = "Hus forbi!";
		this.isMatador = true;
	}
}

class Fool extends Card {
	constructor() {
		this.name = "Narren";
		this.value = 4;
		this.statement = "<Bank bank bank>!";
		this.isFool = true;
	}
}

class Deck {

	constructor() {
		this.cards = [];
		this.discardPile = [];
		for(card in Card.types.items()) {
			this.cards.append(card);
			this.cards.append(card);
		}
		this.shuffleDeck();
	}

	shuffleDeck() {
		console.log ("*** INFO: The deck is shuffled.");
		this.cards = shuffle(this.cards);
	}

	draw() {
		let card = null;
		if (this.isDeckEmpty()) {
			this.useDiscardPile();
		}
		return this.cards.pop();
	}

	useDiscardPile() {
		console.log("**** INFO: The discard deck is used.");
		this.cards = this.discardPile;
		this.shuffleDeck();
		this.discardPile = [];
	}

	isDeckEmpty() {
		return len(this.cards) === 0;
	}

	discard(card) {
		this.discardPile.append(card);
		//console.log ("INFO: A %s card was discarded." % (card.name));
	}

	testLengthSum() {
		if (len(this.cards) + len(this.discardPile) !== 42) {
			console.log ("INFO: Warning! Sum of piles is not 42.");
			this.printCards();
			this.printCards(true);
		}
	}

	printCards(discarded = false) {
		let cardsLine = discarded ? "Discarded: " : "Cards: ";
		let cardList = discarded ? this.discardPile : this.cards;
		for (card in cardList) {
			cardsLine += card.name + ", ";
		}
		cardsLine = cardsLine.slice(0, cardsLine.length - 2);
		console.log (cardsLine);
	}
}

class Human extends Player {

	constructor() {
		this.human = true;
	}

	setHeldCard(card, silent = false) {
		this.printGotCard(card.name);
		super.setHeldCard(card, silent);
	}

	knockOnTable() {
		result = ask("Knock on the table", 0) === 0;
		if (result) {
			speaker.say (this.name + this.TXT_KNOCK);
		}
		return result
	}

	requestSwap(toPlayer) {
		speaker.say (this.sayTo(toPlayer, 0) + quote(this.TXT_WANT_TO_SWAP));
	}

	printGotCard(cardName = "") {
		card = cardName === "" ? this.heldCard.name : cardName;
		speaker.say ("Player ${his.name}, you got the card ${card}.");
	}

	testForSwap(toPlayer) {
		let text = "Do you want to ";
		if (toPlayer == "deck") {
			text += "draw from the deck";
		} else {
			text += "swap cards with ${toPlayer.name}";
		}
		return ask(text, 0) === 0;	
	}
}		

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

	let choice = ask("Play X rounds or first to reach Score", ["x", "s"]);
	if (choice === 0) {
		maxValue = parseInt(input("Enter number of rounds to play: "));
	}
	else if (choice === 1) {
		maxValue = parseInt(input("Enter score to reach: "));
	}
	else {
		choice = 0;
		maxValue = 5;
	}
	let isHuman = false;
	if (ask("Play against computer", 0) === 0) {
		let humanName = input("Please enter your name: ");
		human = new Human(humanName, len(PLAYERS) + 1, speaker);
		players.push(human);
		isHuman = true;
	}

	let game = new GnavGame(choice, maxValue, isHuman);

	PLAYERS.forEach(function (name, index) {
		newPlayer = new Player(name, index, speaker);
		//Test, make Johannes a player that never swaps with anyone nor the deck
		if (index === 2) {
			newPlayer.neverSwapsWithDeck = true;
		}
		players.push(newPlayer);
	});

	players = shuffle(players);
	let deck = new Deck();
	let round = 1;

	while (!game.isGameOver()) {
		speaker.say("Round: ${round} ===> Card pile length: ${deck.cards.length} -----------------------");
		speaker.say("Current dealer is: " + players[0].name);

		//Pop out top player as dealer and insert at end
		let oldDealer = players.shift(); //Pop out first player in list, to act as dealer
		players.append(oldDealer); //Reinsert the dealer at the end of list

		//Draw cards for each player
		for (player in players) {
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
		for (player in players) {
			if (player.heldCard.value === 4) {
				speaker.say ("Unfortunately, " + player.name + "'s card at end of round is Narren.");
				player.addToScore(-1);
			}
		}

		//All players toss their cards in the discard pile
		for (player in players) {
			player.discard(deck);
		}

		deck.testLengthSum();

		mostWins = players.sort((a, b) => a.wins > b.wins);
		mostWins = players.sort((a, b) => a.losses > b.losses);
		mostWins = players.sort((a, b) => a.score > b.score);

		scoreLine = "-------> Scores: "

		for (player in players) {
			thisPly = player.name;
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
			ask("Press ENTER to continue", -1);
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
	for (ply in players) {
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

function startGame() {
	console.log("<<< Welcome to Gnav The Card Game >>>");
	let choice = ask("Play multiplayer game", 0);
	let speaker = null;
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
		speaker = new Speaker();
		playGame(speaker);
	}

}

	// ----------------------------------------------------------------------

/**
 * Class for general speaker object.
 */
class Speaker {
	constructor() {}

	say(what) {
		console.log(what);
	}
}

function ask(question, answers = []) {
	/*
	answers = -1 : auto press any key (i.e. no questions, all answers accepted)
	answers = 0 : auto y/n answers
	*/
	let noChoice = false;
	let possibleAnswers = "";
	let value = -1;
	let error = true;
	let text = !noChoice ? "${question} ${possibleAnswers[:-1]}? " : question;

	if (answers === -1) {
		noChoice = true;
	} else if (answers === 0) {
		answers = ['y', 'n'];
	}
	if (!noChoice) {
		for (answer in answers) {
			possibleAnswers += answer + '/';
		}
	}

	while (error) {
		try {
			choice = input(text);
			if (!noChoice) {
				value = answers.index(choice);
			}
			error = false;
		}
		catch (ValueError) {
			value = -1;
			console.log("Please select either of (${possibleAnswers.splice(0, possibleAnswers.len - 1)})");
		}
	}
	return value;
}

function quote(text) {
	return "'" + text + "'";
}

/**
 * Shuffles array in placey placey. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}