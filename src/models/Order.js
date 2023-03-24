const {DataTypes} = require("sequelize")

module.exports = (sequelize)=>{
    sequelize.define('order',{
        id:{
            type: DataTypes.BIGINT,
            autoIncrement: true,            
            primaryKey: true,
        },
        product_description:{
            type:DataTypes.TEXT,
            allowNull:false,
        },
        total_order_price:{
            type: DataTypes.TEXT,
            allowNull:false
        },        
        prodId:{
            type:DataTypes.TEXT,
            allowNull:false,
        },
        buyer_email:{
            type: DataTypes.TEXT,
            allowNull: false
        },
        product_name:{
            type: DataTypes.TEXT,
            allowNull: false
        },
        product_image:{
            type: DataTypes.TEXT,
            allowNull: false
        },
        product_amount:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        product_unit_price:{
            type: DataTypes.TEXT,
            allowNull: false
        },
        paymentId:{
            type: DataTypes.TEXT,
            allowNull: false
        },
        merchantOrderId:{
            type: DataTypes.TEXT,
            allowNull: false
        },
        statusId:{
            type: DataTypes.TEXT,
            allowNull: false
        }
    },{timestamps:false})
}