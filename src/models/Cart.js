const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "cart",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
          },

      cartUserId: {
        type: DataTypes.BIGINT, // Asegúrate de que sea UUID
        allowNull: false,
        primaryKey: true,
      },
      cartProducts: {
        type: DataTypes.ARRAY(
          DataTypes.JSONB({
            prodId: DataTypes.BIGINT,
            name: DataTypes.STRING, // Nombre del producto
            image: {
              type: DataTypes.JSON,
              public_id: DataTypes.STRING,
              secure_url: DataTypes.STRING,
            },            
            price: DataTypes.DOUBLE, // Precio del producto            
            amount: DataTypes.INTEGER,
          })
        ),
        allowNull: false,
      },
      order: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    { timestamps: false }
  );
};
