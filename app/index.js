require('dotenv-safe').config();
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const Post = require('./models/post.js');
const Star = require('./models/star.js');
const logger = require('./services/logger.js');
const handler = require('./services/handleIt.js');
const httpError = require('./services/httpError.js');
const cleanup = require('./services/cleanup.js');
const dbUri = require('./services/dbUri.js');
const controller = require('./controllers/index.js');

let server;

handler.set('logger', logger);
logger.info('API Start');
logger.info('Connecting to mongodb database');

cleanup.init();
cleanup.set('timeout', 2000);
cleanup.set('listener', function(done, { code, signal, exception, reason, promise } = {}) {
	if (exception) {
		handler.handle(exception, { type: exception.name, subType: 'EXCEPTION', exit: true });
	}
	else if (code) {
		const message = `Program exit with code: ${code}`;
		handler.handle(undefined, { type: 'INFO', level: 'warn', message }, { code });
	}
	else if (signal) {
		const message = `Program exit with signal: ${signal}`;
		handler.handle(undefined, { type: 'INFO', level: 'warn', message }, { signal });
	}
	else if (reason || promise) {
		handler.handle(reason, { type: reason.name, subType: 'REJECTION' });
	}

	function shutDown() {
		if (server) {
			server.close(() => mongoose.disconnect(done));
		}
		else {
			mongoose.disconnect(done);
		}
	}
	setTimeout(shutDown, 300); // give the logger time to write to the filesystem
});

const mongoUri = dbUri();
mongoose.connect(mongoUri, config.get('mongoose.connect'), function(error) {
	const dbErrorMeta = { type: 'DB', subType: 'CONNECTION', exit: true };
	const dbErrorAppend = { uri: mongoUri };

	if (error) {
		return handler.handle(error, dbErrorMeta, dbErrorAppend);
	}

	logger.info('Connected to database');

	mongoose.connection.on('disconnected', function() {
		logger.info('Database disconnected');
	});
	mongoose.connection.on('reconnect', function() {
		logger.info('Database reconnected');
	});
	mongoose.connection.on('reconnectFailed', function() {
		const reconnectError = new Error('Failed to reconnect to mongoDB database');
		handler.handle(reconnectError, dbErrorMeta, dbErrorAppend);
	});
	mongoose.connection.on('error', function(connectionError) {
		handler.handle(connectionError, dbErrorMeta, dbErrorAppend);
	});

	const app = express();
	controller(app, { httpError, handler, Post, Star });

	server = app.listen(process.env.PORT, function() {
		logger.info(`Server now listening on port ${process.env.PORT}`);
	});
	server.on('error', function(serverError) {
		handler.handle(serverError, { type: 'SERVER', exit: true });
	});
});
