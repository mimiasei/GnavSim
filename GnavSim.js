
// Multiplayer stuff -----------------
const HOST = "http://localhost";
const PORT = 8000;

import Player from '/imports/player.js';
import Human from './imports/human.js';		
import Deck from './imports/deck.js';			
import Game from './imports/game.js';	
import Speaker from './imports/speaker.js';

import * as tools from './imports/gnavtools.js';	

$(document).ready(function() {
	console.log("document is ready");

	hideAll();

	Player.index = 1;

	$('#btn_startGame').click(() => {
		$('#start_buttons').hide();
		settingsPart();
	});

	// $('#btnMenu').click(() => {
	// 	hideAll();
	// 	settingsPart();
	// });

	var active_chat = false;

	$('#btn_chat').click(() => {
		active_chat = !active_chat;
		chat(active_chat);
	});
});

var _scope_settings = {
	name : '',
	// computerOnly : false,
	multiplayer : false,
	// winType : 0,
	// winValue : 10
}

function hideAll() {
	$('#chat_section').hide();
	$('#stats_table').hide();
	$('#settingsForm').hide();
	$('#btnNextTurn').hide();
	$('#btnKnock').hide();
	$('#btnMenu').hide();
}

function settingsPart() {
	$('#chat_section').hide();
	$('#settingsForm').show();

	$('#form_computerOnly').click(() => {
		if ($('#form_computerOnly').is(':checked')) {
			$('#form_name').prop('disabled', true);
			$('#form_multiplayer').prop('disabled', true);
		} else {
			$('#form_name').prop('disabled', false);
			$('#form_multiplayer').prop('disabled', false);
		}
	});

	//Temporary warning until multiplayer is implemented
	$('#form_multiplayer').click(() => {
		if ($('#form_multiplayer').is(':checked')) {
			alert("Multiplayer not yet implemented!");
		}
	});

	//handle font change
	$('#form_font').change(() => {
		const value = $( "#form_font option:selected" ).val();
		document.querySelector('body').style.setProperty('--body-font', value);
	});

	document.querySelector('body').style.setProperty('--body-fontsize', '32px');

	//handle font size change
	$('#form_fontSize').change(() => {
		const value = $( "#form_fontSize" ).val();
		document.querySelector('body').style.setProperty('--body-fontsize', value + 'px');
	});

	$('#btn_playGame').click(async () => {
		$('#settingsForm').hide();
		await startGame(await submitSettingsAndReturnGame());
	});
}

async function submitSettingsAndReturnGame() {
	_scope_settings.name = $('#form_name').val();
	_scope_settings.multiplayer = $('#form_multiplayer').is(':checked');

	//Create default game object
	let game = new Game( 
		$('#form_winType').val(), 
		$('#form_winValue').val(), 
		!$('#form_computerOnly').is(':checked')
	);
	
	return game;
}

async function startGame(game) {
	//clear main output element
	game.speaker.clear();

	if (_scope_settings.multiplayer) {
		//todo: implement multiplayer code
	} else {
		await playGame(game);
	}
}

async function playGame(game) {
	//show knock button
	game.speaker.hideKnockButton(true);

	if (game.isHuman && _scope_settings.name) {
		let human = new Human(_scope_settings.name, game.speaker);
		game.players.push(human);
	}

	for (const name of tools.PLAYERS) {
		let newPlayer = new Player(name, game.speaker);

		//Test, make Johannes a player that never swaps with anyone nor the deck
		// if (index === 2) {
		// 	newPlayer.neverSwapsWithDeck = false;
		// }

		game.players.push(newPlayer);
	}

	let playersPromise = tools.shuffle(game.players);
	game.players = await playersPromise; //wait for shuffle to finish

	let deck = new Deck();
	await deck.init(); //async

	let highestScorePlayers = [game.players[0], game.players[1]]; //set players as best and second best score

	//function for when next turn button is clicked
	let nextTurnCallback = (async (result) => {
		game.nextTurn = result;
		game.speaker.hideNextTurnButton();
		highestScorePlayers = await gameLoop(game, deck, highestScorePlayers);
	});

	//function for when knock button is clicked
	let knockCallback = (async (result) => {
		console.log("knocking: ", result);
	});

	game.speaker.initialize(nextTurnCallback, knockCallback);

	//play first turn
	highestScorePlayers = await gameLoop(game, deck, highestScorePlayers);

	//proclaimWinner(highestScore[0], game, round, speaker);
}

async function wantsToSwapTest(game, deck, index) {

	let wantsToSwap = false;
	let sayPass = game.players[index].sayPass();
	let running = true;

	if (running && index !== game.players.len - 1) {
		running = false;

		const watchCallback = async (result) => {
			running = true;
			await swapCards(game, index, result, wantsToSwap, sayPass, deck, running);
		}

		let obj = {
			name : game.players[index + 1] ? game.players[index + 1].name : '',
			result : null
		}
		
		const watchedObj = tools.onChange(obj, watchCallback);

		await game.players[index].testForSwap(watchedObj); //Do small chance check if player has forgotten someone knocked 3 times.

	} else {
		if (game.players[index].testForSwap("deck")) { //Only swap if card is 4 or less.
			speaker.say (game.players[index].name + " draws from the deck.");
			game.players[index].drawFromDeck(deck); //Draw from deck if noone else to swap with.
		} else {
			game.speaker.say (sayPass);
		}
	}
}

async function gameLoop(game, deck, highestScorePlayers) {		
	//clear main output element
	game.speaker.clear();
	
	//refresh table of player stats
	game.speaker.refreshStatsTable(game.players);
	
	game.speaker.printRound(game.value, deck.cards.length);
	game.speaker.addSpace();
	
	// const imageSearches = ['infantry', 'cat', 'horse', 'bird', 'villa', 'jester', 'pot', 'owl'];
	// game.speaker.output.append(getRandomImgElem(imageSearches[round % 8], 80));
	// game.speaker.output.append(imageSearches[round % 8]);

	game.speaker.say("Current dealer is: " + game.players[0].name);

	//Pop out top player as dealer and insert at end
	let oldDealer = game.players.shift(); //Pop out first player in list, to act as dealer
	game.players.push(oldDealer); //Reinsert the dealer at the end of list

	//Draw cards for each player
	for (let i = 0; i < game.players.length; i++) {
		game.players[i].drawFromDeck(deck);

		if (game.players[i].heldCard && game.players[i].heldCard.isFool) { //If player receives Narren
			if (game.players[i].knockOnTable()) {
				game.players[i].addToScore(1);
			}
		}
	}

	// ********* Play round *********
	for (const [index, player] of game.players.entries()) {
		await updateStats(player, game);
		await wantsToSwapTest(game, deck, index);
	}
	// ******** End of round ********
	
	//Calculate scores and stats
	highestScorePlayers = await sumUpGameTurn(game, deck, highestScorePlayers);

	if (game.isGameOver()) {
		return true; //exit loop function
	}

	if (game.isHuman) {
		game.speaker.hideNextTurnButton(true); //show next turn button
		game.speaker.addSpace();
	}

	return highestScorePlayers;
}

async function swapCards(game, index, result, wantsToSwap, sayPass, deck, running) {
	if (game.players[index + 1] && game.players[index + 1].heldCard && game.players[index + 1].heldCard.isFool) { //If the other player has Narren...
		if (result) {
			wantsToSwap = true;
		}
		else {
			sayPass += game.players[index].sayNoFool(game.players[index + 1]);
		}
	}
	else {
		if (!game.players[index].neverSwapsWithDeck && game.players[index].testForSwap(game.players[index + 1])) { //Only ask to swap if card is 4 or less.
			wantsToSwap = true;
		}
		else {
			if (game.players[index].neverSwapsWithDeck) {
				game.speaker.say(game.players[index].name + " never swaps!");
			}
		}
	}
	if (wantsToSwap) {
		// if (!askPlayers(index, game.players[index], game.players, deck, speaker)) { //Check if Staa for gjok! is called.
		if (!askPlayers(index, game, deck)) { //Check if Staa for gjok! is called.
			running = false;
		}
	}
	else {
		game.speaker.say(sayPass);
	}
}

async function sumUpGameTurn(game, deck, highestScorePlayers) {
	//find winner
	let maxVal = await tools.extreme(game.players, 'heldCard.value'); //maxval is default when not passing 3rd param
	console.log("maxval: ", maxVal);
	let winner = game.players[maxVal.mostIndex];
	winner.wins++;
	
	//find loser
	let minVal = await tools.extreme(game.players, 'heldCard.value', tools.FIND_MIN); //tools.FIND_MIN === true
	let loser = game.players[minVal.mostIndex];
	loser.losses++;

	game.speaker.say("Winner of this round is " + winner.name + " with the card " + winner.heldCard.name);
	winner.addToScore(1);
	game.speaker.say("Loser of this round is " + loser.name + " with the card " + loser.heldCard.name);
	loser.addToScore(-1);

	//All game.players toss their card in the discard pile and search for Narren
	for (let player of game.players) {
		if (player.heldCard.ifFool) {
			game.speaker.say("Unfortunately, " + player.name + "'s card at end of round is Narren.");
			player.addToScore(-1);
		}
		player.discard(deck); //toss card to deck's discard pile
	}

	// deck.testLengthSum();

	//most wins
	maxVal = await tools.extreme(game.players, 'wins');
	let ply_mostWins = game.players[maxVal.mostIndex];
	//most losses
	maxVal = await tools.extreme(game.players, 'losses');
	let ply_mostLosses = game.players[maxVal.mostIndex];
	// highest score
	maxVal = await tools.extreme(game.players, 'score');
	let highestScore = game.players[maxVal.mostIndex];

	let scoreLine = '';

	for (let player of game.players) {
		let thisPly = player.name;
		if (player.pid === highestScorePlayers.pid) {
			thisPly = "**" + thisPly.toUpperCase() + "**";
		}
		scoreLine += thisPly + ": " + player.score + ", ";
	}

	game.speaker.addSpace();
	game.speaker.say (scoreLine.slice(0, scoreLine.len - 2));
	game.speaker.say ("GAME STATS: Most wins -> " + ply_mostWins.name + ": " + ply_mostWins.wins + ", most losses -> " + ply_mostLosses.name + ": " + ply_mostLosses.losses);

	//Make it next round
	game.incValue();

	console.log("highest score players:");
	console.log(highestScorePlayers);
	console.log("highest score players end");

	//Set highest score
	if (highestScore > highestScorePlayers[0]) {
		highestScorePlayers.pop(); //remove last item
		highestScorePlayers.unshift(highestScore); //set current highest score player as first item

		game.speaker.say("INFO: Setting " + highestScorePlayers[0].score + " as new best score value for game.");
	}
	game.setHighestScore(highestScorePlayers[0].score);

	game.speaker.addSpace();

	return highestScorePlayers;
}

async function updateStats(player, game) {
	if (game.speaker.statsElems) {
		let elem = null;
		console.log("updateStats:");
		for (elem of Object.keys(game.speaker.statsElems)) {
			console.log(elem);
		}
	}
}

function askPlayers(nbr, game, deck) {
	let nextAdd = 1;
	let hasSwapped = false;
	let dragonen = false;
	let returnedCard = null;

	while (!hasSwapped && !dragonen && (nbr + nextAdd) < game.players.len) {
		game.players[index].requestSwap(game.players[nbr + nextAdd]);
		returnedCard = game.players[nbr + nextAdd].answerSwap(game.players[index]);

		if (returnedCard.constructor.name === 'Fool') {
			game.speaker.say ("Everyone starts laughing and says 'Men " + game.players[nbr + nextAdd].name + " har jo narren!'");
		}

		result = game.players[index].processAnswer(returnedCard);

		if (result === 1) { //Hesten or huset
			nextAdd++;
		} else if (result === 2) { //katten
			game.players[index].addToScore(-1);
			nextAdd++;
		} else if (result === 3) { //dragonen
			dragonen = true;
			game.players[index].addToScore(-1);
		} else if (result === 4) { //gjoeken
			subractFromAllPlayers(game.players[nbr + nextAdd], game.players);
			return false;
		} else { //The two players Swap cards
			game.players[index].swapWithPlayer(game.players[nbr + nextAdd]);
			hasSwapped = true;
		}

		if (!hasSwapped) { //If player still hasn't swapped after being last in round
			game.speaker.say (game.players[index].name + " draws from the deck.");
			game.players[index].drawFromDeck(deck);
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
	game.speaker.addSpace();
	let text = "<<<<<<<<<<<<<<<<<< ";
	if (game.playType === 0) {
		text += `The winner of ${game.maxValue} rounds of GNAV is...`;
	} else {
		text += `The winner after ${round} rounds reaching score ${game.maxValue} is...`;
	}
	text += " >>>>>>>>>>>>>>>>>>";
	game.speaker.say (text);
	game.speaker.say ('<<' +  ' '.repeat(text.length - 4) + '>>');
	let spaces = ((text.length - 2) / 2) - (player.name.length / 2);
	game.speaker.say ('<<' + (' '.repeat(spaces)) + player.name + (' '.repeat(spaces - 2)) + '>>');
	game.speaker.say ('<<' +  ' '.repeat(text.length - 4) + '>>');
	game.speaker.say ('<'.repeat(text.length / 2) + '>'.repeat(text.length / 2));
}

function getRandomImgElem(search, width) {
	let imageUrl = 'https://source.unsplash.com/' + width + 'x' + width + '/?' + search;
	return $( "<img>", { id: search + "_img", src: imageUrl, title: search } );
}

function chat(active_chat) {
	if (active_chat) {
		console.log("starting chat");
		var $input_handle = $('#chat_handle');
		var $input_msg = $('#chat_message');
		var $btn_send = $('#chat_send');
		var $output = $('#chat_output');
		var $comment = $('#chat_comment');
		
		$('#chat_section').show();
		
		var socket = io.connect(HOST + ':' + PORT);
		
		//Emit events
		$btn_send.on('click', function() {
			socket.emit('chat', {
				handle: $input_handle.val(),
				message: $input_msg.val(),
			});
			$input_msg.val(''); //clear message field
		});

		$input_msg.on('keypress', function() {
			socket.emit('typing', $input_handle.val());
		});

		$input_msg.on('keyup', function(event) {
			if (event.keyCode === 13) {
				$btn_send.click();
			}
		});

		//Listen for events
		socket.on('chat', function(data) {
			$output.append('<p><strong>' + data.handle + ': </strong>' + data.message + '</p>');
		});

		socket.on('typing', function(data) {
			$comment.html('<p><em>' + data + ' is typing...</em></p>');
		});


	} else {
		$('#chat_section').hide();
	}
}