'use strict';

export const PLAYERS = ["Kristoffer", "Matias", "Johannes"]; //, "Miriam", "Mikkel", "Emil", "Oivind", "Ask"];
export const MAX_ROUNDS = 1;
export const SWAP_THRESHOLDNUMBER = 4;
export const SWAP_FUZZINESS = 0.03; //Simulates human error. 0.1 = 10% chance of making a mistake.

export const TXT_WANT_TO_SWAP = "Jeg vil gjerne bytte med deg.";
export const TXT_ACCEPT_SWAP = "Jada, her er kortet mitt.";
export const TXT_KNOCK = " banker tre ganger på bordet. <BANK, BANK, BANK>";
export const TXT_PASSES = " sier 'Jeg står'";
export const TXT_NO_WAY_FOOL = [" and thinks 'Aldri i livet, ", "", " har jo narren!'"];

export function ask(question, answers = []) {
	/*
	answers = -1 : auto press any key (i.e. no questions, all answers accepted)
	answers = 0 : auto y/n answers
	*/
	let noChoice = false;
	let possibleAnswers = "";
	let value = -1;
	let error = true;
	let text = !noChoice ? `${question} ${possibleAnswers.slice(0, possibleAnswers.len - 1)}? ` : question;

	if (answers === -1) {
		noChoice = true;
	} else if (answers === 0) {
		answers = ['y', 'n'];
	}
	if (!noChoice) {
		for (answer in answers) {
			possibleAnswers += answer + '/';
		}
	}

	while (error) {
		try {
			choice = input(text);
			if (!noChoice) {
				value = answers.index(choice);
			}
			error = false;
		}
		catch (ValueError) {
			value = -1;
			console.log(`Please select either of (${possibleAnswers.splice(0, possibleAnswers.len - 1)})`);
		}
	}
	return value;
}

export function quote(text) {
	return "'" + text + "'";
}

export function highlight(strings, ...values) {
	let str = '';
	strings.forEach((string, i) => {
		str += string + (values[i] || '');
	});
	return str;
}

/**
 * Shuffles array in placey placey. ES6 version
 * @param {Array} a items An array containing the items.
 */
export function shuffle(a) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}