require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cors = require("cors");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const helmet = require("helmet"); // Importa helmet
const mercadopago = require("mercadopago");

const routes = require("./routes/index.js");
require("./db.js");

const server = express();
server.name = "API";

// Configuración de MercadoPago
const ACCESS_TOKEN_MERCADOPAGO = process.env.ACCESS_TOKEN_MERCADOPAGO;
if (ACCESS_TOKEN_MERCADOPAGO) {
  mercadopagoClient = new mercadopago.MercadoPagoConfig({
    accessToken: ACCESS_TOKEN_MERCADOPAGO,
  });
} else {
  console.error(
    "Error: ACCESS_TOKEN_MERCADOPAGO no está definido en el archivo .env"
  );
}

// Middleware de seguridad - Helmet
server.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://ajax.googleapis.com", // jQuery desde Google CDN
          "https://sdk.mercadopago.com", // SDK de MercadoPago
          "https://accounts.google.com", // Google Sign-In
          "https://cdn.jsdelivr.net", // Bootstrap desde jsDelivr
          "https://unpkg.com", // Ionicons desde unpkg
          "https://opencollective.com/babel",
          "https://github.com",
          "https://eslint.org",
          "https://vitejs.dev",
          "https://cdn-icons-png.flaticon.com",
          "https://wa.me", // WhatsApp
          "https://login.live.com", // Microsoft Login
        ],
        styleSrc: [
          "'self'",
          "https://cdn.jsdelivr.net", // Bootstrap CSS desde jsDelivr
          "https://fonts.googleapis.com", // Google Fonts
        ],
        imgSrc: [
          "'self'",
          "data:", // Permite cargar imágenes en línea
          "https://elgatonegropremium.netlify.app", // Imágenes locales
          "https://res.cloudinary.com", // Cloudinary
          "https://cdn-icons-png.flaticon.com",
          "https://www.instagram.com",
          "https://www.facebook.com",
          "https://web.whatsapp.com",
        ],
        connectSrc: [
          "'self'",
          "https://api.mercadopago.com",
          "https://elgatonegropremium-back-production.up.railway.app", // Backend API
          "https://opencollective.com",
          "https://www.robotstxt.org",
          "https://www.instagram.com",
          "https://web.whatsapp.com",
          "https://wa.me",
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com", // Google Fonts
          "https://cdn.jsdelivr.net", // Fuentes de Bootstrap desde jsDelivr
        ],
        frameSrc: [
          "https://www.mercadopago.com", // iframes de MercadoPago
          "https://login.live.com", // Microsoft Login
        ],
        objectSrc: ["'none'"], // Bloquea elementos <object>
        mediaSrc: ["'self'", "https://res.cloudinary.com"], // Permite solo contenido multimedia desde Cloudinary
      },
    },
  })
);

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      "https://accounts.google.com",
      "http://localhost:5173",
      "https://localhost",
      "https://elgatonegropremium.netlify.app",
      "https://sdk.mercadopago.com",
      "https://accounts.google.com",
      "https://cdn.jsdelivr.net",
      "https://opencollective.com",
      "https://github.com",
      "https://eslint.org",
      "https://vitejs.dev",
      "https://www.instagram.com",
      "https://www.facebook.com",
      "https://web.whatsapp.com",
      "https://cdn-icons-png.flaticon.com",
      "https://wa.me",
      "https://login.live.com",
      "https://elgatonegropremium-back-production.up.railway.app",
      "https://res.cloudinary.com",
      "https://api.mercadopago.com", // MercadoPago
      "https://www.mercadolibre.com", // MercadoLibre
      "https://www.google.com", // Google
    ];
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(
        null,
        true,
        console.log("peticion de origen aceptada desde ", origin)
      );
    } else {
      callback(new Error("No permitida por CORS", origin));
    }
  },
  credentials: true,
};
server.use(cors(corsOptions));

// Middleware de carga de archivos
server.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  })
);

// Middleware de registro de solicitudes HTTP con Morgan
server.use(morgan("dev"));

// Definir un token personalizado para el ID de la solicitud
morgan.token("id", function (req) {
  return req.id;
});

// Condicional para definir la instancia de desarrollo
if (process.env.NODE_ENV === "production") {
  server.use(morgan("combined"));
} else {
  server.use(morgan("dev"));
}

// Configurar Morgan con un formato personalizado
server.use(
  morgan(":id :method :url :status :response-time ms - :res[content-length]")
);

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
      return res.status(400).json({ error: "Invalid URL" });
    }
  }
  next();
};

// Aplicar validación de URL a nivel global
server.use(validateUrlMiddleware);

// Rutas
server.use("/", routes);

server.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
server.use(passport.initialize());
server.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID_LOGIN,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Aquí puedes guardar el perfil del usuario en la base de datos o sesión
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware para manejo de errores
server.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;
