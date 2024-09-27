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

console.log("La instancia es: ", process.env.NODE_ENV);

// Definir un token personalizado para el ID de la solicitud
morgan.token('id', function (req) {
  return req.id;
});

// Condicional para definir la instancia de desarrollo
if (process.env.NODE_ENV === "production") {
  server.use(morgan("combined"));
} else {
  server.use(morgan("dev"));
}

// Configurar Morgan con un formato personalizado
server.use(morgan(':id :method :url :status :response-time ms - :res[content-length]'));

// Middleware para agregar un ID único a cada solicitud
server.use((req, res, next) => {
  req.id = Math.random().toString(36).substring(7);
  next();
});

// Middlewares de Express para parsear JSON y datos URL-encoded
server.use(express.json());
server.use(express.urlencoded({ extended: false }));


// Middleware global para validar URL
const validateUrlMiddleware = (req, res, next) => {
  if (req.body.url) {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    if (!urlRegex.test(req.body.url)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
  }
  next();
};

// Aplicar validación de URL a nivel global
server.use(validateUrlMiddleware);


// Configuración de CORS
server.use(cors());

// Rutas
server.use('/', routes);

// Middleware para manejo de errores
server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;
