/**
 * Class for general speaker object.
 */
class Speaker {
	constructor() {}

	say(what) {
		console.log(what);
	}
}

function ask(question, answers = []) {
	/*
	answers = -1 : auto press any key (i.e. no questions, all answers accepted)
	answers = 0 : auto y/n answers
	*/
	let noChoice = false;
	let possibleAnswers = "";
	let value = -1;
	let error = true;
	let text = !noChoice ? "${question} ${possibleAnswers[:-1]}? " : question;

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
			console.log("Please select either of (${possibleAnswers.splice(0, possibleAnswers.len - 1)})");
		}
	}
	return value;
}

function quote(text) {
	return "'" + text + "'";
}

/**
 * Shuffles array in placey placey. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
