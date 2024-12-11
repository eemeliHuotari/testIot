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
const GRAFANA_URL = 'https://grafana-test-rahti2.2.rahtiapp.fi/render/d-solo/be6imr3v6w16oc/iot2024?orgId=1&from=2024-12-11T04:58:27.200Z&to=2024-12-11T10:58:27.200Z&timezone=browser';
const RENDERER_URL = 'https://grafana-image-renderer-test-rahti2.2.rahtiapp.fi/render';
const API_TOKEN = process.env.GRAFANA_TOKEN;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((error, request, response, next) => {
  if (request.body === '' || (error instanceof SyntaxError && error.type === 'entity.parse.failed')) {
    response.status(415);
    return response.send('Invalid payload!');
  }
  next();
});

app.use('/api', router);

app.get('/grafana-image', async function (req, res) {
  try {
    // Step 1: Fetch the dashboard image or panel data
    const grafanaResponse = await axios.get(GRAFANA_URL, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      responseType: 'arraybuffer', // Fetch raw image data as an array buffer
    });

    // Step 2: Prepare the payload for the Grafana Image Renderer
    const rendererPayload = {
      url: GRAFANA_URL,
      width: 1000,
      height: 500,
      deviceScaleFactor: 1,
    };

    // Step 3: Call the Grafana Image Renderer
    const renderResponse = await axios.post(RENDERER_URL, rendererPayload, {
      headers: {
        "Content-Type": "application/json"
      },
      responseType: 'arraybuffer',
    });

    res.set('Content-Type', 'image/png');
    res.send(renderResponse.data);
  } catch (error) {
    console.error('Error fetching or rendering Grafana image:', error.response?.data || error.message);
    res.status(500).send('Error fetching or rendering Grafana image');
  }
});

app.use('/ready', (request, response) => response.sendStatus(200));
app.use('/live', (request, response) => response.sendStatus(200));

module.exports = app;
