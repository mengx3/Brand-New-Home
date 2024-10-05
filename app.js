const express = require('express');
const mysql = require('mysql2');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const http = require('http');
const coap = require('coap');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mqtts',
});

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/strategies', (req, res) => {
  pool.query('SELECT * FROM strategy', (error, results) => {
    if (error) {
      res.status(500).send('Error retrieving strategies from database');
    } else {
      res.send(results);
    }
  });
});

app.put('/setFlag', (req, res) => {
  const { strategy_id, flag } = req.body;
  pool.query(`UPDATE strategy SET flag = ${flag} WHERE strategy_id = ${strategy_id}`, (error, results) => {
    if (error) {
      res.status(500).send('Error updating flag in database');
    } else {
      res.send(results);
    }
  });
});
