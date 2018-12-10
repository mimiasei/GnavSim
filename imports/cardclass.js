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
        return new classes[className](name, value);
    }
}

export default CardClass;