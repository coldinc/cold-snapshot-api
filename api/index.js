// update

const express = require('express');
const serverless = require('serverless-http');
const axios = require('axios');
const app = express();

app.use(express.json());

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

const airtableURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

app.get('/latest-snapshot', async (req, res) => {
  try {
    const response = await axios.get(airtableURL, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      },
      params: {
        sort: '[{"field":"Date","direction":"desc"}]',
        maxRecords: 1
      }
    });
    res.json(response.data.records[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching snapshot');
  }
});

app.post('/new-snapshot', async (req, res) => {
  try {
    const { date, markdown, updates, phase, createdBy, tags } = req.body;
    const fields = {
      Date: date,
      "Snapshot Markdown": markdown,
      "Key Updates": updates || "",
      "Phase ID": phase || "",
      "Created By": createdBy || "",
      Tags: tags || []
    };
    const response = await axios.post(airtableURL, { records: [{ fields }] }, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error posting snapshot');
  }
});

module.exports = app;
module.exports.handler = serverless(app);
