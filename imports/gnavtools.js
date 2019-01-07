'use strict';

export const PLAYERS = ["Kristoffer", "Matias", "Johannes", "Miriam", "Emil", "Øivind"]; //, "Ask", "Pappa", "Mamma", "Lars Erik", "Morten", "Ola", "Åsa"
export const MAX_ROUNDS = 1;
export const SWAP_THRESHOLDNUMBER = 4;
export const SWAP_FUZZINESS = 0.08; //Simulates human error. 0.1 = 10% chance of making a mistake.

export const TXT_WANT_TO_SWAP = "Jeg vil gjerne bytte med deg.";
export const TXT_ACCEPT_SWAP = "Jada, her er kortet mitt.";
export const TXT_KNOCK = " banker tre ganger på bordet. <BANK, BANK, BANK>";
export const TXT_PASSES = " sier 'Jeg står'";
export const TXT_NO_WAY_FOOL = [" and thinks 'Aldri i livet, ", "", " har jo narren!'"];

export const MINVAL = true;

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

export function range(start, end) {
	let array = [];

	for (let i = start; i <= end; i++) {
		array.push(i);
	}

	return array;
}

/**
 * Shuffles array in placey placey. ES6 version
 * @param {Array} array items An array containing the items.
 */
export async function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
	 	const j = Math.floor(Math.random() * (i + 1));
	 	[array[i], array[j]] = [array[j], array[i]];
	}
	return array; //returns Promise with shuffled array
}

export function log(message, game) {
	game = game || null;
    let stack = new Error().stack,
        caller = stack.split('\n')[2].trim().replace('http://localhost:8000/imports/', '');
    console.log(caller + (game && game.playerStack && game.playerStack.current() ? '|' + game.playerStack.current().name : '') + ":" + message);
}

export function getExtreme(array, attr, getMax) {
	const parts = attr ? attr.split('.') : null;

	if (parts) {
		if (parts.length > 1) {
			if (getMax) {
				const extremeVal = Math.max.apply(Math, array.map((o) => { return o[parts[0]][parts[1]]; }));
				return array.find((o) => { return o[parts[0]][parts[1]] == extremeVal; });
			} else {
				const extremeVal = Math.min.apply(Math, array.map((o) => { return o[parts[0]][parts[1]]; }));
				return array.find((o) => { return o[parts[0]][parts[1]] == extremeVal; });
			}
		} else {
			if (getMax) {
				const extremeVal = Math.max.apply(Math, array.map((o) => { return o[parts[0]]; }));
				return array.find((o) => { return o[parts[0]] == extremeVal; });
			} else {
				const extremeVal = Math.min.apply(Math, array.map((o) => { return o[parts[0]]; }));
				return array.find((o) => { return o[parts[0]] == extremeVal; });
			}
		}
	}

	return null;
}

/**
 * Usage example:
 * 
 * const callback = (async (num) => {
 * 	  		await waitFor(50); // <== timeout function
 *    		console.log(num);
 * 		});
 * 
 * const start = async () => {
 * 		asyncForEach([1, 2, 3], callback);
 *    	console.log('Done!);
 * }
 * 
 * start();
 * 
 * // prints: (waits 50ms) 1 (waits 50ms) 2 (waits 50ms) 3 Done!
 */
export async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}
