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


