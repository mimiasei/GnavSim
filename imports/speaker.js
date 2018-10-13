'use strict';

/**
 * Class for general speaker object.
 */
export default class Speaker {

	constructor() {
		this._output = $("#" + "outputWin");
		this._stats = $("#" + "playerStats");
		this._info = $("#" + "info");
		this._value = -1;
		this._statsElems = [];
	}

	get output() { return this._output }
	get stats() { return this._stats }
	get info() { return this._info }
	get value() { return this._value }
	get statsElems() { return this._statsElems }

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

	clear() {
		this._output.html('');
	}

	say(what, type) {
		type = type || 'div';
		let $elem = $( "<" + type + ">", { id: this.makeid(), text: what } );
		// $elem.hover(
		// 	function () { $(this).addClass('hover'); },
		// 	function () { $(this).removeClass('hover'); }
		// )
		// $elem.click( function() {
		// 	console.log($elem[0]);
		// });
		this._output.append($elem);
	}

	addSpace() {
		this.say("", "br");
	}

	ask(question, answers, callbackFn) {
		/*
		answers = -1 : auto press any key (i.e. no questions, all answers accepted)
		answers = 0 : auto y/n answers
		*/
		//answers = answers || -1;	
		let noChoice = false;
	
		if (answers === -1) {
			noChoice = true;
		} else if (answers === 0) {
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

		this.say(question);
		
		for (let answer of answers) {
			let element = document.createElement("button"); //create button element
			let text = document.createTextNode(answer.text); //create button text
			element.appendChild(text);
			element.type = 'button';
			element.name = 'btn_' + answer.text + '_' + this.makeid();
			element.value = answer.value;
			element.onclick = callbackFn;
			this._output.append(element); //add button to output div
		}
	}

	input(question) {
		let randomName = this.makeid();
		let $inputElem = $('<input type="text" class="fieldname" id="' + randomName + '"/>');
		this._output.append($inputElem);
	}

	addToStats(name) {
		type = type || 'div';
		let $elem = $( "<" + type + ">", { id: this.makeid(name, type), text: name } );
		statsElems.push($elem);
		this._stats.append($elem);
	}

	getStatsElem(name) {
		return this._statsElems.find((e) => {
			return e.text = name; 
		});
	}

	sayFromStats(what, type) {
		type = type || 'div';
		let $elem = $( "<" + type + ">", { id: this.makeid(what.split(' ')[0], type), text: what } );
		this._stats.append($elem);
	}

	makeid(text, type) {
		let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let rnd = "";
		for (let i = 0; i < 7; i++) {
			rnd += possible.charAt(Math.floor(Math.random() * possible.length));
	    }

		text = text || rnd;
		type = type || 'div';

		return type + '_' + text;
	}

	getValue() {
		return this.value;
	}
}