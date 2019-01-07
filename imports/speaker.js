'use strict';

import * as tools from './gnavtools.js';

/**
 * Class for general speaker object.
 */
export default class Speaker {

	constructor(parent) {
		this._output = $("#outputWin");
		this._humanName = $('#form_name').val();
		this._multiplayer = $('#form_multiplayer').is(':checked');
		this._outputBtns = [];
		this._stats = $("#playerStats");
		this._info = $("#info");
		this._modal = $("#modalWindow");
		this._statsTable = null;
		this._tableData = [];
		this._statsTableBody = $("#stats_table tbody");
		this._nextTurnButton = $("#btnNextTurn");
		this._nextPlayerButton = $("#btnNextPlayer");
		this._knockButton = $("#btnKnock");
		this._currentPlayerText = $("#currentPlayer");
		this._currentDealerText = $("#currentDealer");
		this._statsElems = [];
		this._elemId = 0;
		this._parent = parent;
	}

	get output() { return this._output }
	get humanName() { return this._humanName }
	get multiplayer() { return this._multiplayer }
	get stats() { return this._stats }
	get info() { return this._info }
	// get value() { return this._value }
	get statsElems() { return this._statsElems }
	get parent() { return this._parent }
	//stats table
	get statsTable() { return this._statsTable }
	get tableData() { return this._tableData }
	//buttons
	get nextTurnButton() { return this._nextTurnButton }
	get nextPlayerButton() { return this._nextPlayerButton }
	get knockButton() { return this._knockButton }

	set output(value) { this._output = $.extend(true, {}, value) }
	set stats(value) { this._stats = $.extend(true, {}, value) }
	set info(value) { this._info = $.extend(true, {}, value) }
	// set value(value) { this._value = value }

	static clone(speaker) {
		let cloned = Object.assign (Object.create (Object.getPrototypeOf (speaker)), speaker);
		// cloned.output = speaker.output;
		// cloned.value = speaker.value;
		return cloned;
	}

	initialize(callbacks) {
		this._nextTurnButton.click(() => { callbacks.nextTurnCallback(true); });
		this._nextPlayerButton.click(() => { callbacks.nextPlayerCallback(true); });
		this._knockButton.click(() => { callbacks.knockCallback(true); });

		//init stats table
		this._statsTable = new Tabulator('#stats_table', {
			columnHeaderSortMulti: false,
			layout: "fitColumns",
			responsiveLayout: "hide",
			tooltipsHeader: false,
			rowFormatter: function(row) {
				if (row.getData().current) {
					row.getElement().style['font-weight'] = '1000';
					row.getElement().style['font-size'] = '15px';
				}
			},
			columns: [
				{ title: 'Name', field: 'name', headerSort: false, widthGrow: 2, responsive: 0, minWidth: 70 },
				{ title: 'Score', field: 'score', align: 'center', headerSort: false, minWidth: 40 },
				{ title: 'Wins', field: 'wins', align: 'center', headerSort: false, responsive: 3, minWidth: 40 },
				{ title: 'Losses', field: 'losses', align: 'center', headerSort: false, responsive: 4, minWidth: 40 },
			],
			//function for when a table row is clicked
			rowClick: (e, row) => {
				alert(
					'Player: ' + row.getData().name + '\n\n' +
					'score: ' + row.getData().score + '\n' +
					'wins: ' + row.getData().wins + '\n' +
					'losses: ' + row.getData().losses
				);
			}
		});
	}

	hideStatsTable(show) {
		show = show || false;

		if (show) {
			$('#stats_table').show();
		} else {
			$('#stats_table').hide();
		}
	}

	updateCurrentPlayer() {
		this._currentPlayerText.text(this._parent.playerStack.current().name);
		this._currentDealerText.text(this._parent.playerStack.dealer().name);
	}

	hideButton(type, show) {
		switch(type) {
			case 'turn':
			case 0: show ? this._nextTurnButton.show() : this._nextTurnButton.hide();
					break;

			case 'player':
			case 1: show ? this._nextPlayerButton.show() : this._nextPlayerButton.hide();
					break;

			case 'knock':
			case 2: show ? this._knockButton.show() :  this._knockButton.hide();
					break;
		}
	}
	
	clear() {
		this._output.html('');
		for (let btn of this._outputBtns) {
			btn.html('');
		}
	}
	
	createElem(txt, type, className) {
		txt = txt || '';
		type = type || 'div';
		className = className || '';
		let $elem = $( "<" + type + ">", { id: this.makeid('', type), text: txt } );
		if (className) {
			$elem.addClass(className);
		}
		return $elem;
	}
	
	say(what, type, className, addToOutput) {
		type = type || 'div';
		className = className || '';
		addToOutput = addToOutput || true;
		let $elem = this.createElem(what, type, className);
		if (addToOutput) {
			this._output.append($elem);
		} else {
			return $elem;
		}
	}
	
	printRound() {
		this.say(`Turn: ${this.parent.turn}. Card pile length: ${this.parent.deck.getLength()}`, 'span', 'print-round');
	}
	
	addSpace(n) {
		n = n || 1;
		n = n > 4 ? 4 : n;
		
		this.say('', 'div', 'margin-top-' + n * 10);
	}
	
	async ask(question, answers, callbackFn) {
		//if answers === 0 : default yes/no answers
		if (answers === 0) {
			answers = [
				{
					text : 'Yes',
					value : true
				},
				{			
					text : 'No',
					value : false
				},
			];
		}
		
		this.hideButton('turn');

		this.openModal(question, answers, callbackFn);
	}
	
	openModal(question, answers, callbackFn, useCloseBtn) {
		useCloseBtn = useCloseBtn || false;
		tools.log("opening modal...");

		//display modal
		this._modal.show();

		this._modal.draggable({
			handle: ".modal-header"
		});
		
		//setup close buttons
		let closeBtn = $("#modalCloseBtn");
		closeBtn.click((e) => {
			this._modal.hide();
		});

		if (useCloseBtn) {
			$('#modalBtn_2').click((e) => {
				this._modal.hide();
			});
		} else {
			$('#modalBtn_2').hide();
		}

		$("#modalTitle").text("Swap card");
		$("#modalBody").text(question + '?');

		for (let i = 0; i < answers.length; i++) {
			$(`#modalBtn_${i}`).text(answers[i].text);
			$(`#modalBtn_${i}`).click((e) => {
				this._modal.hide();
				callbackFn(answers[i].value);
			});
		}
	}

	createBtn(name, callbackFn) {
		let element = $(`<button type="button" class="btn btn-primary margin-left-10">${name}</button>`);
		element.click(() => { callbackFn(true); });
		return element;
	}

	speech(name, message) {
		this._parent.gui.speech(name, message);
		this._parent.gui.update();
	}

	updateStats(player) {
		const index = this.getStatsIndex(player);
		// tools.log(`found stats index for ${player.name}: ${index}`);

		if (index >= 0) {
			this._tableData[index].score = player.score;
			this._statsTable.updateData([{ id: index, score: player.score }]);
			this._statsTable.redraw();
		} else {
			tools.log('stats table not initialized yet, skipping score update.');
		}
	}

	addToStats(name, type) {
		let $elem = this.createElem(name, type);
		this._statsElems.push($elem);
		this._stats.append($elem);
	}

	refreshStatsTable() {
		this._tableData = [];

		for (const player of this._parent.players) {
			let obj = { 
				name: player.name + (player.heldCard ? player.heldCard.value : ''),
				score: player.score,
				wins: player.wins,
				losses: player.losses,
				current: player.isCurrent,
			};
			this._tableData.push(obj);
		}
		
		this._statsTable.clearData();
		this._statsTable.replaceData(this._tableData).then(() => {
			this._statsTable.redraw();
		});
	}

	getStatsIndex(player) {
		return this._tableData.findIndex(line => line.name === player.name);
	}

	getStatsElem(name) {
		return this._statsElems.find((e) => {
			return e.text === name; 
		});
	}

	makeid(text, type) {
		text = text || 'elem';
		type = type || 'div';

		return type + '_' + text.split(' ')[0] + this._elemId++;
	}

	sumUpGameTurn() {
		//find winner
		const winner = this._parent.findWinner();
		winner.wins++;
		
		//find loser
		const loser = this._parent.findLoser();
		loser.losses++;
	
		this.say(`Winner of this turn is ${winner.name} with the card ${winner.heldCard.name}.`);
		winner.addToScore(1);
		this.say(`Loser of this turn is ${loser.name} with the card ${loser.heldCard.name}.`);
		loser.addToScore(-1);
	
		//All game.players toss their card in the discard pile and search for Narren
		for (let player of this._parent.players) {
			if (player.heldCard.isFool) {
				this.say(`Unfortunately, ${player.name}'s card at end of turn is Narren.`);
				player.addToScore(-1);
			}
			player.discard(this._parent.deck); //toss card to deck's discard pile
		}
	
		//DEBUG:
		// deck.testLengthSum();
	
		//most wins
		const ply_mostWins = tools.getExtreme(this._parent.players, 'wins');
		//most losses
		const ply_mostLosses = tools.getExtreme(this._parent.players, 'losses');
		// highest score
		const ply_highestScore = tools.getExtreme(this._parent.players, 'score');
	
		let scoreLine = '';
		const thisPly = '**' + ply_highestScore.name.toUpperCase() + '**';
		scoreLine += thisPly + ': ' + ply_highestScore.score + ', ';

		this.addSpace();
		this.say (scoreLine.slice(0, scoreLine.len - 2));
		this.say (`GAME STATS: Most wins -> ${ply_mostWins.name}: ${ply_mostWins.wins}, most losses -> ${ply_mostLosses.name}: ${ply_mostLosses.losses}`);
		this.addSpace();	
	}

	proclaimWinner(player) {
		this.addSpace();
		let text = "<<<<<<<<<<<<<<<<<< ";
		if (this._parent.playType === 0) {
			text += `The winner of ${this._parent.maxValue} turns of GNAV is...`;
		} else {
			text += `The winner after ${this._parent.turn} turns reaching score ${this._parent.maxValue} is...`;
		}
		text += " >>>>>>>>>>>>>>>>>>";
		this.say (text);
		this.say ('<<' +  ' '.repeat(text.length - 4) + '>>');
		let spaces = ((text.length - 2) / 2) - (player.name.length / 2);
		this.say ('<<' + (' '.repeat(spaces)) + player.name + (' '.repeat(spaces - 2)) + '>>');
		this.say ('<<' +  ' '.repeat(text.length - 4) + '>>');
		this.say ('<'.repeat(text.length / 2) + '>'.repeat(text.length / 2));
	}
}