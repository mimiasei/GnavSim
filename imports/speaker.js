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
		this._knockButton = $("#btnKnock");
		// this._value = -1;
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

	initialize(nextTurnCallback, knockCallback) {
		this._nextTurnButton.click(() => { nextTurnCallback(true); });
		this._knockButton.click(() => { knockCallback(true); });

		//init stats table
		this._statsTable = new Tabulator('#stats_table', {
			columnHeaderSortMulti: false,
			layout: "fitColumns",
			responsiveLayout: "hide",
			tooltipsHeader: false,
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
		//show stats table
		$('#stats_table').show();
	}

	
	hideNextTurnButton(show) {
		show = show || false;
		if (show) {
			this._nextTurnButton.show();
		} else {
			this._nextTurnButton.hide();
		}
	}

	hideKnockButton(show) {
		show = show || false;
		if (show) {
			this._knockButton.show();
		} else {
			this._knockButton.hide();
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
	
	static async answerObj(arrayText, arrayValues) {
		arrayValues = arrayValues || [];
		let array = [];
		for (let i = 0; i < arrayText.length; i++) {
			if (typeof arrayValues[i] === 'undefined') {
				arrayValues[i] = i;
			}
			array.push({
				text: arrayText[i],
				value: arrayValues[i]
			});
		}
		return array;
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
		
		this.hideNextTurnButton();

		await this.openModal(question, answers, callbackFn);
	}
	
	async openModal(question, answers, callbackFn, useCloseBtn) {
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

	async input(question, callbackFn) {
		let div = this.createElem(null, null, 'margin-top-10'); //create button group div
		div.append(this.say(question, 'span', 'margin-right-10', false));
		let group = this.createElem('', 'div', 'flex'); //create empty flex div
		let $inputElem = $('<input type="text"/>');
		$inputElem.id = this.makeid(question.split(' ')[0], 'inp');
		group.append($inputElem);
		let element = this.createBtn('Enter', callbackFn);
		group.append(element);
		this._output.append(group);
	}

	updateStats(player) {
		const index = this.getStatsIndex(player);
		tools.log(`found stats index for ${player.name}: ${index}`);
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

	async refreshStatsTable() {
		this._tableData = [];

		for (const player of this._parent.players) {
			let obj = { 
				name: player.name,
				score: player.score,
				wins: player.wins,
				losses: player.losses,
			};
			this._tableData.push(obj);
		}
		
		this._statsTable.clearData();
		this._statsTable.replaceData(this._tableData).then(() => {
			this._statsTable.redraw();
			tools.log("table updated!");
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

	async sayFromStats(what, type) {
		type = type || 'div';
		let $elem = this.createElem(what, type);
		this._stats.append($elem);
	}

	makeid(text, type) {
		text = text || 'elem';
		type = type || 'div';

		return type + '_' + text.split(' ')[0] + this._elemId++;
	}

	async sumUpGameTurn() {
		//DEBUG, skip this method for now
		return true;

		//find winner
		let winner = this._parent.findWinner();
		winner.wins++;
		
		//find loser
		let loser = this._parent.findLoser();
		loser.losses++;
	
		this.say("Winner of this turn is " + winner.name + " with the card " + winner.heldCard.name);
		winner.addToScore(1);
		this.say("Loser of this turn is " + loser.name + " with the card " + loser.heldCard.name);
		loser.addToScore(-1);
	
		//All game.players toss their card in the discard pile and search for Narren
		for (let player of this.parent.players) {
			if (player.heldCard.ifFool) {
				this.say("Unfortunately, " + player.name + "'s card at end of turn is Narren.");
				player.addToScore(-1);
			}
			player.discard(this.parent.deck); //toss card to deck's discard pile
		}
	
		//DEBUG:
		// deck.testLengthSum();
	
		//most wins
		maxVal = await tools.extreme(this.parent.players, 'wins');
		let ply_mostWins = this.parent.players[maxVal.mostIndex];
		//most losses
		maxVal = await tools.extreme(this.parent.players, 'losses');
		let ply_mostLosses = this.parent.players[maxVal.mostIndex];
		// highest score
		maxVal = await tools.extreme(this.parent.players, 'score');
		let highestScore = this.parent.players[maxVal.mostIndex];
	
		let scoreLine = '';
	
		for (let player of this.parent.players) {
			let thisPly = player.name;
			if (player.pid === highestScorePlayers.pid) {
				thisPly = "**" + thisPly.toUpperCase() + "**";
			}
			scoreLine += thisPly + ": " + player.score + ", ";
		}
	
		this.addSpace();
		this.say (scoreLine.slice(0, scoreLine.len - 2));
		this.say ("GAME STATS: Most wins -> " + ply_mostWins.name + ": " + ply_mostWins.wins + ", most losses -> " + ply_mostLosses.name + ": " + ply_mostLosses.losses);
	
		//Set highest score
		if (highestScore > this.parent.highestScorePlayers[0]) {
			this.parent.highestScorePlayers.pop(); //remove last item
			this.parent.highestScorePlayers.unshift(highestScore); //set current highest score player as first item
	
			this.say("INFO: Setting " + this.parent.highestScorePlayers[0].score + " as new best score value for game.");
		}
		
		this.parent.setHighestScore(this.parent.highestScorePlayers[0].score);
		this.addSpace();	
	}

	proclaimWinner(player) {
		this.addSpace();
		let text = "<<<<<<<<<<<<<<<<<< ";
		if (this.parent.playType === 0) {
			text += `The winner of ${this.parent.maxValue} turns of GNAV is...`;
		} else {
			text += `The winner after ${this.parent.turn} turns reaching score ${this.parent.maxValue} is...`;
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