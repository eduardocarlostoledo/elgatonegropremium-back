const { Order, Product, User } = require("../db");


async function updateProductStock(prodId, product_amount) {
  try {
    const product = await Product.findOne({ where: { id: prodId } });

    if (product) {
      const newStock = product.stock - product_amount;

      newStock <= 0 ? await Product.update({status: false}, { where: { id: prodId } }) : null

      await Product.update({ stock: newStock }, { where: { id: prodId } });

      console.log(
        `El stock del producto con ID ${prodId} se ha actualizado a ${newStock}.`
      );
    } else {
      console.log(`No se encontró un producto con ID ${prodId}.`);
    }
  } catch (error) {
    console.log(
      `Error al actualizar el stock del producto con ID ${prodId}: ${error.message}`
    );
  }
}

const postOrder = async (
    paymentId,
    statusId,
    merchantOrderId,
    product_description,     
    total_order_price,      
    prodId,
    buyer_email,
    product_name,
    product_image,
    product_amount,
    product_unit_price) => {  

  try {    
    const newOrder = await Order.create({
        paymentId,
        statusId,
        merchantOrderId,
        product_description,     
        total_order_price,      
        prodId,
        buyer_email,
        product_name,
        product_image,
        product_amount,
        product_unit_price
    });

    const user=await User.findOne({where:{email:buyer_email}})
    user.addOrder(newOrder);

    console.log("POST CONTROLLER CREATED ORDER", newOrder);

    return newOrder;
  } catch (error) {
    throw Error(error.message);
  }
};

const getOrders = async () => {
  try {
    const allorders = await Order.findAll();     
    return allorders;
  } catch (error) {
    throw new Error("Error retrieving orders: " + error.message);
  }
};

module.exports = { postOrder, getOrders, updateProductStock };
