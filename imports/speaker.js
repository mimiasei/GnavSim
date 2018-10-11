'use strict';

/**
 * Class for general speaker object.
 */
export default class Speaker {

	constructor() {
		this._output = $("#" + "outputWin");
		this._value = -1;
	}

	get output() { return this._output }
	get value() { return this._value }

	set output(value) { this._output = jQuery.extend(true, {}, value) }
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

	makeid() {
		let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let text = "";

		for (let i = 0; i < 7; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return text;
	}

	getValue() {
		return this.value;
	}
}