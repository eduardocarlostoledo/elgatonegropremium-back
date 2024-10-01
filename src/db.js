require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const {
  DB_USER, DB_PASSWORD, DB_HOST,DB_NAME, DB_PORT
} = process.env;

const sequelize = new Sequelize(`postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
  
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
});

const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { Product, User, Type, Brand, Cart, Order} = sequelize.models;

// Aca vendrian las relaciones
// Product.hasMany(Reviews);

User.belongsToMany(Product,{through:"user_product"})
Product.belongsToMany(User,{through:"user_product"})
Brand.hasMany(Product,{
  foreignKey: 'brandId',
});

Product.belongsTo(Brand)

Type.hasMany(Product,{
  foreignKey: 'typeId',
})
Product.belongsTo(Type)

// User.hasMany(Cart,{
//   foreignKey:'userId'
// })
// Cart.belongsTo(User);

// En tu archivo de asociaciones (associations.js)
Cart.belongsTo(User, { foreignKey: 'cartUserId' });
User.hasMany(Cart, { foreignKey: 'cartUserId' });



User.hasMany(Order,{
  foreignKey:'userId'
})
Order.belongsTo(User);


module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
};