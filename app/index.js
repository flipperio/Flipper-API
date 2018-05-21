require('dotenv-safe').config();
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const Post = require('./models/post.js');
const Star = require('./models/star.js');
const logger = require('./services/logger.js');

const dbUri = require('./services/dbUri.js');
const controller = require('./controllers/index.js');

let server;


logger.info('API Start');
logger.info('Connecting to mongodb database');


const mongoUri = dbUri();
mongoose.connect(mongoUri, config.get('mongoose.connect'), function(error) {
	logger.info('Connected to database');

	mongoose.connection.on('disconnected', function() {
		logger.info('Database disconnected');
	});
	mongoose.connection.on('reconnect', function() {
		logger.info('Database reconnected');
	});
	mongoose.connection.on('reconnectFailed', function() {

	});
	mongoose.connection.on('error', function(connectionError) {

	});

	const app = express();
	controller(app, { Post, Star });

	server = app.listen(process.env.PORT, function() {
		logger.info(`Server now listening on port ${process.env.PORT}`);
	});
	server.on('error', function(serverError) {

	});
});
