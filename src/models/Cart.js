const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('cart', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4, // Genera automáticamente un UUID v4
            primaryKey: true,
        },
        prodId: {
            type: DataTypes.BIGINT, // Cambiado a UUID
            allowNull: false,
        },
        cartUserId: {
            type: DataTypes.UUID, // Asegúrate de que sea UUID
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        order: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
    }, { timestamps: false });
};

// const {DataTypes, UUID} = require("sequelize")

// module.exports = (sequelize)=>{
//     sequelize.define('cart',{
//         id: {
//             type: DataTypes.UUID,
//             defaultValue: DataTypes.UUIDV4, // Genera automáticamente un UUID v4
//             primaryKey: true,
//           },
//         prodId:{
//             type: DataTypes.BIGINT,
//             allowNull:false,
//         },
//         cartUserId:{
//             type:DataTypes.UUID,
//             allowNull:true
//         },
//         name:{
//             type:DataTypes.STRING,
//             allowNull:false,
//         },
//         image:{
//             type: DataTypes.STRING,
//             allowNull:false
//         },
//         amount:{
//             type:DataTypes.INTEGER,
//             allowNull:false
//         },
//         price:{
//             type: DataTypes.DOUBLE,
//             allowNull: false
//         },
//         order: {
//             type: DataTypes.BIGINT,
//             allowNull: false,
//             defaultValue: 0
//         }
//     },{timestamps:false})}