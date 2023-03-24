const express = require('express');
const routes = require('./routes/index.js');
const fileUpload =require('express-fileupload');
const cors = require("cors");
const mercadopago = require("mercadopago");
mercadopago.configure({
	access_token: "TEST-2173554663380212-021616-6c499d124b985881a40b539254bb3afd-96768851",
});

require('./db.js');

const server = express();

server.name = 'API';

//para subir archivo a cloudinary
server.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './uploads'
}))

server.use(express.json())
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

server.use('/', routes);
server.use(cors());
server.use(express.urlencoded({ extended: false }));

// Error catching endware.
server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;