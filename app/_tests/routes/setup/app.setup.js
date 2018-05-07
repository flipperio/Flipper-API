/*
* Establish an express app for testing
*/
const express = require('express');
const rfr = require('rfr');

const controllers = rfr('app/controllers');
const mocks = require('./mocks.setup.js');

const app = express();
controllers(app, mocks);
module.exports = app;
