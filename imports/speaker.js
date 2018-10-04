'use strict';

/**
 * Class for general speaker object.
 */
export default class Speaker {

	constructor() {
		this.outputElem = $("#" + "outputWin");
		this.value = -1;
	}

	say(what) {
		this.outputElem.text(what);
	}

	ask(question, answers = []) {
		/*
		answers = -1 : auto press any key (i.e. no questions, all answers accepted)
		answers = 0 : auto y/n answers
		*/
		let noChoice = false;
		let possibleAnswers = "";
		let text = !noChoice ? "${question} ${possibleAnswers.splice(0, possibleAnswers.len - 1)}? " : question;
	
		if (answers === -1) {
			noChoice = true;
		} else if (answers === 0) {
			answers = ['Yes', 'No'];
		}

		for (let answer of answers) {
			let element = document.createElement("input"); //create button element
			element.type = 'button';
			element.value = 0;
			element.name = 'btn_' + answer;
			element.onclick = function() {
				alert ("You clicked ", element.name, " returning value ", element.value);
				this.value = element.value;
			}
			this.outputElem.add(element); //add button to output div
		}
	}

	input(question) {
		let randomName = this.makeid();
		let inputElem = $('<input type="text" class="fieldname" id="${randomName}"/>');
		this.outputElem.add(inputElem);
	}

	makeid() {
		let text = "";
		let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (let i = 0; i < 5; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return text;
	}

	getValue() {
		return this.value;
	}
}