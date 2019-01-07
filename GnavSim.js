
// Multiplayer stuff -----------------
const HOST = "http://localhost";
const PORT = 8000;
	
import Game from './imports/game.js';	
import Player from './imports/player.js';	
import * as tools from './imports/gnavtools.js';

$(document).ready(function() {
	/**
	 *Declare static class variables:
	 */
	//Player:
	Player.index = 1;
	//Game:
	Game.STATE_START_TURN = 'sStartTurn';
	Game.STATE_BEFORE_SWAP = 'sBeforeSwap';
	Game.STATE_DECIDED_SWAP = 'sDecidedSwap';
	Game.STATE_SKIPPED_SWAP = 'sSkippedSwap';
	Game.STATE_AFTER_SWAP = 'sAfterSwap';
	Game.STATE_END_PLAYER = 'sEndPlayer';
	Game.STATE_END_TURN = 'sEndTurn';

	//hide all game UI
	hideAll();

	$('#btn_startGame').click(() => {
		$('#start_buttons').hide();

		//Create default game object
		const game = new Game( 
			$('#form_winType').val(), 
			$('#form_winValue').val(), 
			!$('#form_computerOnly').is(':checked')
		);

		//set up speaker and state event listeners
		game.init();

		settingsPart(game);
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
	$('#btnNextPlayer').hide();
	$('#btnKnock').hide();
	$('#btnMenu').hide();
}

function settingsPart(game) {
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

		startGame(game);
	});
}

function startGame(game) {
	if (game.speaker.multiplayer) {
		//todo: implement multiplayer code
	} else {
		game.initGame();
	}
}

////////////////////////////////////////////

function chat(active_chat) {
	if (active_chat) {
		tools.log("starting chat");
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

	function getRandomImgElem(search, width) {
		let imageUrl = 'https://source.unsplash.com/' + width + 'x' + width + '/?' + search;
		return $( "<img>", { id: search + "_img", src: imageUrl, title: search } );
	}
}