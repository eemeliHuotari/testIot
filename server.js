// OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
const axios = require('axios');

Object.assign = require('object-assign');


app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));


const GRAFANA_URL = 'https://grafana-test-rahti2.2.rahtiapp.fi/render/d-solo/iot2024';
const API_TOKEN = process.env.GRAFANA_TOKEN;


var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';


app.get('/', function (req, res) {
    res.render('index.html', { pageCountMessage: null });
});

app.get('/grafana-image', async function (req, res) {
    try {
        const response = await axios.get(GRAFANA_URL, {
            headers: {
                Authorization: `Bearer ${API_TOKEN}`
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

app.get('/pagecount', function (req, res) {
    res.send('{ pageCount: -1 }');
});


app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something bad happened!');
});


app.listen(port, ip, function () {
    console.log('Server running on http://%s:%s', ip, port);
});

module.exports = app;
