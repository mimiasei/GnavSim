'use strict';

/**
 * Class for general speaker object.
 */
export default class Speaker {

	constructor(parent) {
		this._output = $("#outputWin");
		this._outputBtns = [];
		this._outputBtns.push($("#outputBtn1"));
		this._outputBtns.push($("#outputBtn2"));
		this._outputBtns.push($("#outputBtn3"));
		this._stats = $("#playerStats");
		this._info = $("#info");
		this._statsTable = null;
		this._tableData = [];
		this._statsTableBody = $("#stats_table tbody");
		this._nextTurnButton = $("#btnNextTurn");
		this._value = -1;
		this._statsElems = [];
		this._elemId = 0;
		this._parent = parent;
	}

	get output() { return this._output }
	get stats() { return this._stats }
	get info() { return this._info }
	get value() { return this._value }
	get statsElems() { return this._statsElems }
	get parent() { return this._parent }
	get nextTurnButton() { return this._nextTurnButton }
	get statsTable() { return this._statsTable }
	get tableData() { return this._tableData }

	set output(value) { this._output = jQuery.extend(true, {}, value) }
	set stats(value) { this._stats = jQuery.extend(true, {}, value) }
	set info(value) { this._info = jQuery.extend(true, {}, value) }
	set value(value) { this._value = value }

	static clone(speaker) {
		let cloned = Object.assign (Object.create (Object.getPrototypeOf (speaker)), speaker);
		cloned.output = speaker.output;
		cloned.value = speaker.value;
		return cloned;
	}

	initialize(callbackFn) {
		this._nextTurnButton.click(() => { callbackFn(true); });
		this._statsTable = new Tabulator('#stats_table', {
			columnHeaderSortMulti: false,
			autoResize: false,
			layout: "fitColumns",
			// data: this._tableData,
			columns: [
				{ title: 'Id', field: 'id', headerSort: false, width: 5 },
				{ title: 'Name', field: 'name', headerSort: false, width: 84 },
				{ title: 'Score', field: 'score', align: 'center', headerSort: false, width: 20 },
				{ title: 'Wins', field: 'wins', align: 'center', headerSort: false, width: 20 },
				{ title: 'Losses', field: 'losses', align: 'center', headerSort: false, width: 20 },
			],
			rowClick: (e, row) => {
				alert(
					'Player: ' + row.getData().name + '\n\n' +
					'score: ' + row.getData().score + '\n' +
					'wins: ' + row.getData().wins + '\n' +
					'losses: ' + row.getData().losses
				);
			}
		});
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

	printRound(round, cardLength) {
		this.say(`Round: ${round}. Card pile length: ${cardLength}`, 'span', 'print-round');
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
		//answers = 0 : default yes/no answers
		if (answers === 0) {
			answers = [
				{
					text : 'Yes',
					value : 0
				},
				{			
					text : 'No',
					value : 1
				},
			];
		}

		let div = this.createElem(null, null, 'margin-top-10'); //create group div
		div.append(this.say(question, 'span', 'margin-right-10'));
		this._output.append(div); //add group to output div
		for (const [index, answer] of answers.entries()) {
			let element = this.createBtn(answer.text, callbackFn);
			this._outputBtns[index].html(element);
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

	addToStats(name, type) {
		let $elem = this.createElem(name, type);
		this._statsElems.push($elem);
		this._stats.append($elem);
	}

	refreshStatsTable(players) {
		this._tableData = [];

		for (let i = 0; i < players.length; i++) {
			let obj = { 
				id: i + 1, 
				name: players[i].name,
				score: players[i].score,
				wins: players[i].wins,
				losses: players[i].losses,
			};
			this._tableData.push(obj);
		}
		console.log("table data: ");
		console.log(this._tableData);
		
		this._statsTable.clearData();
		this._statsTable.replaceData(this._tableData).then(() => {
			this._statsTable.redraw();
			console.log("table updated!");
		});
	}

	getStatsElem(name) {
		return this._statsElems.find((e) => {
			return e.text = name; 
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
}