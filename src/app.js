require('dotenv').config();
const express = require('express');
const cors = require("cors");
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const mercadopago = require("mercadopago");

const routes = require('./routes/index.js');
require('./db.js');

const server = express();

server.name = 'API';

// Configuración de MercadoPago
const ACCESS_TOKEN_MERCADOPAGO = process.env.ACCESS_TOKEN_MERCADOPAGO;
if (ACCESS_TOKEN_MERCADOPAGO) {
  mercadopago.configure({
    access_token: ACCESS_TOKEN_MERCADOPAGO,
  });
} else {
  console.error("Error: ACCESS_TOKEN_MERCADOPAGO no está definido en el archivo .env");
}

// Middleware
server.use(morgan('dev')); // middleware de registro de solicitudes HTTP para Node.js
server.use(cors());
server.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './uploads'
}));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

// Rutas
server.use('/', routes);

// Error catching endware.
server.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;


// require('dotenv').config();
// const express = require('express');
// const routes = require('./routes/index.js');
// const fileUpload = require('express-fileupload');
// const cors = require("cors");
// const mercadopago = require("mercadopago");
// const ACCESS_TOKEN_MERCADOPAGO = process.env.ACCESS_TOKEN_MERCADOPAGO;

// mercadopago.configure({
//   access_token: ACCESS_TOKEN_MERCADOPAGO,
// });

// require('./db.js');

// const server = express();

// server.name = 'API';

// //para subir archivo a cloudinary
// server.use(fileUpload({
//   useTempFiles: true,
//   tempFileDir: './uploads'
// }))

// server.use(express.json())
// server.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
//   next();
// });

// server.use('/', routes);
// server.use(cors());
// server.use(express.urlencoded({ extended: false }));

// // Error catching endware.
// server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
//   const status = err.status || 500;
//   const message = err.message || err;
//   console.error(err);
//   res.status(status).send(message);
// });

// module.exports = server;