const { Cart, Product, User } = require("../db");

const addProductCart = async (payload) => {
  const { name, user, amount } = payload;
  console.log("Producto addProductCart:", name, user.email, amount);
  
  const cantidadFinal = amount > 0 ? amount : 1;
  const prod = await Product.findOne({ where: { name } });
  const esUsuario = await User.findOne({ where: { id: user.id } });
  const tieneCarrito = await Cart.findOne({ where: { cartUserId: user.id } });

  if (!prod) throw Error("El producto no existe");
  if (!esUsuario) throw Error("Debe registrarse para comprar");

  // Depuración
  console.log("producto encontrado", prod?.dataValues?.id || "no encontrado");
  console.log("es usuario valido", esUsuario ? "sí" : "no");
  console.log("tiene carrito", tieneCarrito ? "sí" : "no");

  // Comprobar stock antes de cualquier acción
  if (prod.dataValues.stock < cantidadFinal) {
    throw Error("Stock insuficiente para la cantidad solicitada");
  }

  // Crear carrito si no existe
  if (!tieneCarrito) {
    await Cart.create({
      cartUserId: esUsuario.id,
      cartProducts: [
        {
          prodId: prod.id,
          name: prod.name,
          image: prod.image,
          price: prod.price,
          amount: cantidadFinal,
        },
      ],
      order: Date.now(),
    });
    return "Producto agregado al carrito";
  }

  // Si el carrito ya existe, actualizarlo
  console.log("Actualizando carrito existente");

  // Verificar si el producto ya está en el carrito
  const productIndex = tieneCarrito.cartProducts.findIndex(
    (item) => item.prodId === prod.dataValues.id
  );
  
  if (productIndex !== -1) {
    // Si el producto ya está en el carrito, aumentar la cantidad
    const nuevaCantidad = tieneCarrito.cartProducts[productIndex].amount + cantidadFinal;
    if (nuevaCantidad > prod.dataValues.stock) {
      throw Error("Se ha superado el stock disponible");
    }
    tieneCarrito.cartProducts[productIndex].amount = nuevaCantidad;
  } else {
    // Si el producto no está en el carrito, agregarlo
    tieneCarrito.cartProducts.push({
      name: prod.dataValues.name,
      image: prod.dataValues.image,
      price: prod.dataValues.price,
      amount: cantidadFinal,
      prodId: prod.dataValues.id,
    });
  }

  // Actualizar el carrito con los productos nuevos
  await tieneCarrito.update({ cartProducts: tieneCarrito.cartProducts });
  return tieneCarrito;
};


// const addProductCart = async (payload) => {
//   const {name, user, amount} = payload
//   console.log("Producto addProductCart:", name, user.email, amount);   
//   const cantidadFinal = amount > 0 ? amount : 1;
//   const prod = await Product.findOne({ where: { name } });
//   const esUsuario = await User.findOne({ where: { id: user.id } });
//   const tieneCarrito = await Cart.findOne({ where: { cartUserId: user.id } });

//   if (!prod) throw Error("El producto no existe");  
//   if (!esUsuario) throw Error("Debe registrarse para comprar");
// //depuradores
//   if (prod) console.log("producto encontrado", prod.dataValues.id)
//   if (esUsuario) console.log("es usuario valido")
//   if (!tieneCarrito) console.log("no tiene carrito")
//     if(tieneCarrito) console.log ("tiene carrito")

//   // Crear carrito si no existe
//   if (!tieneCarrito && prod.dataValues.stock >= cantidadFinal) {
//     await Cart.create({
//       cartUserId: esUsuario.id,
//       cartProducts: [
//         {
//           prodId: prod.id,
//           name: prod.name,
//           image: prod.image,
//           price: prod.price,
//           amount: cantidadFinal, // Utilizamos la cantidad proporcionada
//         },
//       ],
//       order: Date.now(),
//     });
//     return "Producto agregado al carrito";
//   }

//   // Si el carrito ya existe, actualizarlo
//   if ( tieneCarrito && prod.dataValues.stock >= cantidadFinal && esUsuario ) {
//     console.log("entro a tiene carrito", tieneCarrito.cartProducts)    

//     // Verificar si el producto ya está en el carrito
//     const productIndex = tieneCarrito.cartProducts.findIndex((item) => item.prodId === prod.dataValues.id);
//     if (productIndex !== -1) {
//       // Si el producto ya está en el carrito, aumentar la cantidad
//       tieneCarrito.cartProducts[productIndex].amount += cantidadFinal;
//       if (prod.dataValues.stock > tieneCarrito.cartProducts[productIndex].amount) throw Error ("Se ha superado el stock")
//     } else {
//   console.log("el producto no esta en el carrito")
//       // Si el producto no está, agregarlo con la cantidad proporcionada
//       tieneCarrito.cartProducts.push({
//         name: prod.dataValues.name,
//         image: prod.dataValues.image,
//         price: prod.dataValues.price,
//         amount: cantidadFinal, // Cantidad proporcionada o 1 por defecto
//         prodId: prod.dataValues.id,
//       });
//     }

//     // Actualizar el carrito con los productos nuevos
//     await tieneCarrito.update({ cartProducts: tieneCarrito.cartProducts });
//     return tieneCarrito;
//   }

//   // Si el stock del producto es insuficiente
//   if (prod.dataValues.stock < cantidadFinal) {
//     throw Error("Stock insuficiente para la cantidad solicitada");
//   }
// };

const getProductsCart = async () => {
  try {
    const productsCart = await Cart.findAll({ order: [["order", "ASC"]] });
    return productsCart;
  } catch (error) {
    console.error("No se han encontrado datos");
  }
};

const getCarritoDeUsuario = async (userId) => {
  try {
    const solicitarCarritoDelCliente = await Cart.findByPk(userId)
    if (!solicitarCarritoDelCliente)    throw Error("No tiene carrito")
    else return solicitarCarritoDelCliente.cartProducts
  } catch (error) {
    throw Error ("Hubo un error al solicitar la información")
  }
}

// const deleteProductCart = async (prodId, user) => {
//   const prod = await Product.findOne({ where: { id: prodId } });
//   if (!prod) throw Error("El producto no existe");

//   const esUsuario = await User.findOne({ where: { id: user.id } });
//   if (!esUsuario) throw Error("El usuario no existe");

//   const tieneCarrito = await Cart.findOne({ where: { cartUserId: user.id } });
//   if (!tieneCarrito) throw Error("El usuario no posee carritos para eliminar");

//   let productosEnCarrito = tieneCarrito.cartProducts;

//   const productIndex = productosEnCarrito.findIndex((item) => item.prodId === prodId);
//   if (productIndex === -1) throw Error("El producto no está en el carrito");

//   if (productosEnCarrito[productIndex].amount > 1) {
//     // Reducir la cantidad en 1
//     productosEnCarrito[productIndex].amount -= 1;
//   } else {
//     // Si tiene exactamente 1, eliminar el producto del array
//     productosEnCarrito.splice(productIndex, 1);
//   }

//   await tieneCarrito.update({ cartProducts: productosEnCarrito });
//   return "Se ha modificado el carrito";
// };

const deleteProductCart = async (prodId, user) => {
  // Verificar existencia del producto y usuario en una consulta paralela
  const [prod, esUsuario] = await Promise.all([
    Product.findOne({ where: { id: prodId } }),
    User.findOne({ where: { id: user.id } })
  ]);

  if (!prod) throw new Error("El producto no existe");
  if (!esUsuario) throw new Error("El usuario no existe");

  // Buscar el carrito del usuario
  const tieneCarrito = await Cart.findOne({ where: { cartUserId: user.id } });
  if (!tieneCarrito) throw new Error("El usuario no posee carritos para eliminar");

  // Obtener productos y buscar el índice del producto en el carrito
  let productosEnCarrito = tieneCarrito.cartProducts;
  const productIndex = productosEnCarrito.findIndex(item => item.prodId === prodId);

  if (productIndex === -1) throw new Error("El producto no está en el carrito");

  // Reducir cantidad o eliminar el producto si solo queda 1
  if (productosEnCarrito[productIndex].amount > 1) {
    productosEnCarrito[productIndex].amount -= 1;
  } else {
    productosEnCarrito.splice(productIndex, 1);
  }

  // Actualizar el carrito en la base de datos
  await tieneCarrito.update({ cartProducts: productosEnCarrito });
  return "Se ha modificado el carrito";
};


// const deleteAllCart = async (user) => {
//   try {
//     const tieneCarrito = await Cart.findOne({ where: { cartUserId: user.id } });

//     if (!tieneCarrito) {
//       throw Error("No hay carrito para este usuario");
//     } else {
//       await Cart.destroy({ where: { cartUserId: user.id } });
//       return "El carrito se eliminó";
//     }
//   } catch (error) {
//     console.error("Ha surgido un inconveniente en la base de datos");
//   }
// };

const deleteAllCart = async (user) => {
  try {
    const tieneCarrito = await Cart.findOne({ where: { cartUserId: user.id } });
    if (!tieneCarrito) throw new Error("No hay carrito para este usuario");

    await Cart.destroy({ where: { cartUserId: user.id } });
    return "El carrito se eliminó";
  } catch (error) {
    console.error("Error eliminando el carrito:", error.message);
    throw new Error("Ha surgido un inconveniente en la base de datos");
  }
};


module.exports = {
  deleteAllCart,
  getProductsCart,
  addProductCart,
  deleteProductCart,
  getCarritoDeUsuario,
};
