'use strict';

import Cuckoo from './cuckoo.js';
import Dragoon from './dragoon.js';
import Cat from './cat.js';
import Horse from './horse.js';
import House from './house.js';
import Fool from './fool.js';
import Card from './card.js';

const classes = { Card, Cuckoo, Dragoon, Cat, Horse, House, Fool };

class CardClass {
    constructor (className, name, value) {
        console.log('*********************** class name: ' + className);
        return new classes[className](name, value);
    }

    static deepCopy(card) {
		let clone = new CardClass(card.name, card.name, card.value);
		clone.statement = card.statement;
		clone.isMatador = card.isMatador;
		clone.causeNoMoreSwap = card.causeNoMoreSwap;
		clone.causeLosePoint = card.causeLosePoint;
		clone._causeAllLosePointAndStopGame = card.causeAllLosePointAndStopGame;
		clone.isFool = card.isFool;

		tools.log('------ DEEPCOPY ------');
		console.log(card);
		console.log(clone);

		return clone;
	}
}

export default CardClass;