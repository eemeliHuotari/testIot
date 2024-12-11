'use strict';

/*
 *
 *  Copyright 2016-2017 Red Hat, Inc, and individual contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

const logger = require('./logger.js');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

const router = require('./lib/routes/router');
const GRAFANA_URL = 'https://grafana-test-rahti2.2.rahtiapp.fi/render/d-solo/your-dashboard-id';
const API_TOKEN = process.env.GRAFANA_TOKEN;

app.use(bodyParser.json());
app.use((error, request, response, next) => {
  if (request.body === '' || (error instanceof SyntaxError && error.type === 'entity.parse.failed')) {
    response.status(415);
    return response.send('Invalid payload!');
  }

  next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', router);

app.get('/grafana-image', async function (req, res) {
  try {
    const response = await axios.get(GRAFANA_URL, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      responseType: 'arraybuffer',
    });
    res.set('Content-Type', 'image/png');
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching Grafana image:', error);
    res.status(500).send('Error fetching Grafana image');
  }
});

// Add a health check
app.use('/ready', (request, response) => {
  return response.sendStatus(200);
});

app.use('/live', (request, response) => {
  return response.sendStatus(200);
});


module.exports = app;
