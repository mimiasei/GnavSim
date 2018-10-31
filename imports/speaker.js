'use strict';

/**
 * Class for general speaker object.
 */
export default class Speaker {

	constructor() {
		this._output = $("#" + "|outputWin");
		this._outputBtns = [];
		this._outputBtns.push($("#"| + "outputBtn1"));
		this._outputBtns.push($("#"| + "outputBtn2"));
		this._outputBtns.push($("#"| + "outputBtn3"));
		this._stats = $("#" + "p|layerStats");
		this._info = $("#" + "info");
		this._value = -1;
		this._statsElems = [];
		this._elemId = 0;
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

	addSpace(n) {
		n = n || 1;
		n = n > 4 ? 4 : n;

		this.say('', 'div', 'row margin-top-' + n * 10);
	}

	static answerObj(arrayText, arrayValues) {
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

	ask(question, answers, callbackFn) {
		/*
		answers = -1 : auto press any key (i.e. no questions, all answers accepted)
		answers = 0 : auto y/n answers
		*/
		answers = answers || 
			[
				{
					text : 'Yes',
					value : 0
				},
				{			
					text : 'No',
					value : 1
				},
			];
		
		let div = this.createElem(null, null, 'margin-top-10'); //create button group div
		div.append(this.say(question, 'span', 'margin-right-10'));

		let index = 0;
		for (let answer of answers) {
			let element = this.createBtn(answer.text, callbackFn);
			this._output.append(element);
			index++;
		}

		this._output.append(div); //add button group to output div
	}

	createBtn(name, callbackFn) {
		let element = document.createElement("button"); //create button element

			element.appendChild(document.createTextNode(name)); //add button text
			element.type = 'button';
			element.name = this.makeid(name, 'btn');
			element.value = 1;
			element.className = 'btn btn-primary margin-left-10';
			element.onclick = callbackFn;
		return element;
	}

	input(question, callbackFn) {
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
		type = type || 'div';
		let $elem = $( "<" + type + ">", { id: this.makeid(name, type), text: name } );
		this._statsElems.push($elem);
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
		// let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		// let rnd = "";
		// for (let i = 0; i < 5; i++) {
		// 	rnd += possible.charAt(Math.floor(Math.random() * possible.length));
	    // }
		text = text || 'elem';
		type = type || 'div';

		return type + '_' + text + this._elemId++;
	}
}