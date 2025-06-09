const express = require('express');
const bodyParser = require('body-parser');
const latestSnapshot = require('./latest-snapshot');
const newSnapshot = require('./new-snapshot');

const app = express();
app.use(bodyParser.json());

app.get('/api/latest-snapshot', latestSnapshot);
app.post('/api/new-snapshot', newSnapshot);

module.exports = app;