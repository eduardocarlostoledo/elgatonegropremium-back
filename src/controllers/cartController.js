const { Cart, Product, User } = require("../db");

const addProductCart = async (product) => {
  console.log("Producto addProductCart:", product);
  const { name, image, price, user } = product;

  // Buscar el producto que coincida con el name
  const prod = await Product.findOne({ where: { name } });
  //console.log("prod", prod);

  // Si no hay producto con ese name lanzo un error
  if (!prod) throw Error("El producto no existe");

  // Si los atributos enviados por body existen...
  if (name && image && price) {
      // Si el producto no está en el carrito, lo agrego y cambio el atributo inCart del producto a true
      if (!prod.inCart) {
          await Cart.create({
              prodId: prod.id, // UUID
              cartUserId: user.id, // UUID del usuario
              name,
              image,
              price,
              amount: 1,
              order: Date.now(),
          });
          await prod.update({ inCart: true });
      } else {
          // Si el producto ya está en el carrito, actualizo la cantidad
          const cart = await Cart.findOne({ where: { name, cartUserId: usuarioId } }); // Usa el UUID correcto aquí
          await cart.update({ amount: cart.amount + 1 });
      }
  } else throw Error("Faltan datos para añadir el producto al carrito");

  return "Producto agregado al carrito";
};



const getProductsCart = async () => {

  try {
    const productsCart = await Cart.findAll({order: [['order', 'ASC']]});
      return productsCart;
  } catch (error) {
    console.error ("no se han encontrado datos")
  }
      
};

const deleteProductCart=async (prodId) => {
  //busco el producto en  el carrito que coincida con el id del producto pasado por params
  const prodToDelete=await Cart.findOne({where:{prodId}});
  
  //si el producto no esta en el carrito lanzo un error
  if(!prodToDelete) throw Error ("El producto que desea eliminar no está en el carrito");

  //si de este producto solo esta agregada una unidad en el carrito...
  if(prodToDelete.amount===1) {
    //actualizo el atributo inCart a false
    await Product.update({inCart:false},{where:{id:prodId}})
    //y elimino este producto del carrito
    await Cart.destroy({where:{prodId}})
  }
  //si de este producto estan agregadas mas de una unidad al carrito, actualizo el producto del carrito
  //quitandole una unidad
  else prodToDelete.update({amount:prodToDelete.amount -1})

  return "Se quitó el producto del carrito";
}

const deleteAllCart=async () => {
  const cart = await Cart.findAll();
  //Lanza un error en caso de fallo
  if(!cart) throw Error("No hay productos en el carrito")
  /* Eliminar todo el contenido del carrito */
  await Cart.destroy({ where: {} });
  /* Actualizar la columna 'inCart' de todos los productos a false */
  await Product.update({ inCart: false }, { where: {} });
  /* Devolver una respuesta exitosa */
  return "El carrito se eliminó"
} 

  module.exports = {
    deleteAllCart,
    getProductsCart,
    addProductCart,
    deleteProductCart,
  };
  