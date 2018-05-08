/*
* Initialize all necessary setup for integration tests
*/
const dbSetup = require('./db.setup.js');
const dataSetup = require('./data.setup.js');
const appSetup = require('./app.setup.js');

const setup = {
	_initPromise: null,
	app: appSetup,
	data: dataSetup.data,
	utils: {
		randomInt: function(min, max) {
			// exclusive at max
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min)) + min;
		},
		generateString: function(size) {
			const charRange = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 -=_+[]{};,.<>/?!@##$';
			let outString = '';
			for (let i = 0; i < size; i++) {
				outString += charRange[setup.utils.randomInt(0, charRange.length)];
			}
			return outString;
		},
	},
	expectations: {
		apiPath: 'api',
		contentType: 'application/json; charset=utf-8',
	},
	init: function init() {
		if (setup._initPromise) {
			return setup._initPromise;
		}

		setup._initPromise = dbSetup.init().then(dataSetup.init);
		return setup._initPromise;
	},
	teardown: function teardown() {
		setup._initPromise = null;
		return dataSetup.teardown().then(dbSetup.disconnect);
	},
};

module.exports = setup;
