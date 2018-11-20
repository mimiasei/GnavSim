'use strict';

export const PLAYERS = ["Kristoffer", "Matias", "Johannes", "Miriam", "Mikkel", "Emil", "Øivind", "Ask", "Pappa", "Mamma", "Lars Erik", "Morten", "Ola", "Åsa"];
export const MAX_ROUNDS = 1;
export const SWAP_THRESHOLDNUMBER = 4;
export const SWAP_FUZZINESS = 0.03; //Simulates human error. 0.1 = 10% chance of making a mistake.

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

export function* range(start, end) {
	for (let i = start; i <= end; i++) {
		yield i;
	}
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

export async function extreme(array, attr, findMin) {
	array = array || [];
	attr = attr || null;
	findMin = findMin || false;
	if (array.length < 1) {
		return -1;
	}
	
	let obj = {
		most : findMin ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER,
		mostIndex : 0,
		currentIndex : 0,
		findMin : findMin,
		attr : attr
	}
	let promises = [];

	for (let index = 0; index < array.length; index++) {
		const parts = attr ? attr.split('.') : null;
		const value = parts ? (parts.length > 1 ? array[index][parts[0]][parts[1]] : array[index][parts[0]]) : array[index];
		obj.currentIndex = index;
		promises.push(compare(value, obj));
	}

	const result = await Promise.all(promises);
	return Array.isArray(result) ? result[0] : result;

	async function compare(value, obj) {
		if (obj.findMin) {
			if (value < obj.most) {
				obj.most = value;
				obj.mostIndex = obj.currentIndex;
			}
		} else {
			if (value > obj.most) {
				obj.most = value;
				obj.mostIndex = obj.currentIndex;
			}
		}
		return obj;
	}
}

export function onChange(object, onChangeFn) {
	const handler = {
		get(target, property, receiver) {
			try {
				return new Proxy(target[property], handler);
			} catch (err) {
				return Reflect.get(target, property, receiver);
			}
		},
		defineProperty(target, property, descriptor) {
			onChangeFn();
			return Reflect.defineProperty(target, property, descriptor);
		},
		deleteProperty(target, property) {
			onChangeFn();
			return Reflect.deleteProperty(target, property);
		}
	};

	return new Proxy(object, handler);
};