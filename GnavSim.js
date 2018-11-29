
// Multiplayer stuff -----------------
const HOST = "http://localhost";
const PORT = 8000;
	
import Game from './imports/game.js';	
import * as tools from './imports/gnavtools.js';

$(document).ready(function() {
	console.log("document is ready");

	hideAll();

	// Player.index = 1;

	$('#btn_startGame').click(() => {
		$('#start_buttons').hide();
		settingsPart();
	});

	var active_chat = false;

	$('#btn_chat').click(() => {
		active_chat = !active_chat;
		chat(active_chat);
	});
});

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
		let game = await createGame();
		await startGame(game);
	});
}

async function createGame() {
	// _scope_settings.name = $('#form_name').val();
	// _scope_settings.multiplayer = $('#form_multiplayer').is(':checked');

	//Create default game object
	let game = new Game( 
		$('#form_winType').val(), 
		$('#form_winValue').val(), 
		!$('#form_computerOnly').is(':checked')
	);

	//set up speaker and state event listeners
	await game.init();
	
	return game;
}

async function startGame(game) {
	if (game.speaker.multiplayer) {
		//todo: implement multiplayer code
	} else {
		await game.initGame();
	}
}

async function wantsToSwapTest(game, index) {

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
			game.players[index].drawFromDeck(); //Draw from deck if noone else to swap with.
		} else {
			game.speaker.say (sayPass);
		}
	}
}

function askPlayers(nbr, game) {
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
			game.players[index].drawFromDeck();
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