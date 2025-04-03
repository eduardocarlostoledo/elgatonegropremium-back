const { Router } = require("express");
const { Preference } = require("mercadopago");
const payRouter = Router();
const mercadopago = require("mercadopago");
const { deleteAllCart } = require("../controllers/cartController");
//const enviarMail = require("../mail/nodemail");
const {
  postOrder,
  updateProductStock,
} = require("../controllers/orderControllers");
const { Cart } = require("../db");
const { User } = require("../db");
const { Order } = require("../db");
const { UUID, where } = require("sequelize");

// Configuración de MercadoPago
const ACCESS_TOKEN_MERCADOPAGO = process.env.ACCESS_TOKEN_MERCADOPAGO;

let mercadopagoClient;

if (ACCESS_TOKEN_MERCADOPAGO) {
  mercadopagoClient = new mercadopago.MercadoPagoConfig({
    accessToken: ACCESS_TOKEN_MERCADOPAGO,
  });
} else {
  console.error(
    "Error: ACCESS_TOKEN_MERCADOPAGO no está definido en el archivo .env"
  );
}

// const newPreference = new Preference(mercadopagoClient);
// console.log(newPreference);
// newPreference.get({ preferenceId: '<PREFERENCE_ID>' }).then(console.log).catch(console.log);

// let arrayPreference = {};

// let arrayProducts = [];
payRouter.post("/preference", (req, res) => {
  //console.log(mercadopago)
  //console.log("LLEGA REQ.BODY 0", req.body[0],"1", req.body[1]);

  // Extraer los datos correctamente
  const products = req.body.slice(0, -1); // Todos los elementos excepto el último
  const { total_order_price, datos_Comprador } = req.body[req.body.length - 1]; // El último elemento

  //console.log("APAREZCO!!!!!!!!!!! ", datos_Comprador);

  // Crear el objeto arrayPreference
  let arrayPreference = {
    product_description: "description",
    total_order_price,
    prodId: products[0]?.prodId, // Tomar el prodId del primer producto
    datos_Comprador,
    product_name: products[0]?.product_name,
    product_image: products[0]?.product_image,
    product_amount: products[0]?.product_amount,
    product_unit_price: products[0]?.product_unit_price,
  };

  //console.log("TENGO PREFERENCE", arrayPreference);

  // Crear el array de productos
  arrayProducts = products.map((prod) => ({
    id: prod.prodId,
    amount: prod.product_amount,
  }));

  //console.log("ACA ESTOY!!!!!!!!!", arrayProducts);

  res.status(200).json({ message: "Preference data received" });
});

payRouter.post("/create_preference", async (req, res) => {
  try {
    const { orderData, preferencia } = req.body;

    // Validar datos recibidos
    if (!orderData || !preferencia) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // Buscar el usuario en la base de datos
    const user = await User.findOne({
      where: { email: orderData.datos_Comprador.email },
    });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Buscar el carrito del usuario
    const cart = await Cart.findOne({ where: { cartUserId: user.id } });
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Crear la orden en la base de datos
    const newOrder = await Order.create({
      userId: user.id,
      cartId: cart.id,
      buyer_email: user.email,
      buyer_name: orderData.datos_Comprador.name,
      buyer_lastname: orderData.datos_Comprador.lastname,
      buyer_phone: orderData.datos_Comprador.phone,
      buyer_address: {
        address: orderData.datos_Comprador.address,
        state: orderData.datos_Comprador.state,
        city: orderData.datos_Comprador.city,
        country: orderData.datos_Comprador.country,
      },
      products: preferencia,
      total_order_price: orderData.total_order_price,
    });

    // Crear la preferencia de MercadoPago
    const instanciaPreferencia = new Preference(mercadopagoClient);
    const response = await instanciaPreferencia.create({
      body: {
        items: preferencia.map((prod) => ({
          id: prod.prodId,
          title: prod.product_name,
          quantity: prod.product_amount,
          unit_price: prod.product_unit_price,
        })),
        back_urls: {
          success: `${process.env.BACK}/pay/feedback/success`,
          failure: `${process.env.BACK}/pay/feedback/failure`,
          pending: `${process.env.BACK}/pay/feedback/pending`,
        },
        external_reference: newOrder.id, // Usar el ID de la orden como referencia externa
        auto_return: "approved",
        payer: {
          phone: { area_code: "", number: orderData.datos_Comprador.phone },
          email: orderData.datos_Comprador.email,
          identification: { number: "", type: "" },
          name: orderData.datos_Comprador.name,
          surname: orderData.datos_Comprador.lastname,
        },
        shipments: {
          receiver_address: {
            address: orderData.datos_Comprador.address,
            state: orderData.datos_Comprador.state,
            city_name: orderData.datos_Comprador.city,
            country_name: orderData.datos_Comprador.country,
          },
        },
      },
    });

    // Devolver el ID de la preferencia
    res.status(200).json({ id: response.id });
  } catch (error) {
    console.error("Error en /create_preference:", error);
    res.status(500).json({ error: "Error al crear la preferencia" });
  }
});

payRouter.get("/feedback/success", async (req, res) => {
  try {
    const {
      collection_id,
      collection_status,
      payment_id,
      status,
      external_reference,
      payment_type,
      merchant_order_id,
      preference_id,
      site_id,
      processing_mode,
    } = req.query;

    // Validar que la referencia externa esté presente
    if (!external_reference) {
      throw new Error("Falta la referencia externa");
    }

    // Buscar la orden en la base de datos
    const order = await Order.findOne({ where: { id: external_reference } });
    if (!order) {
      throw new Error(`No se encontró la orden con ID: ${external_reference}`);
    }
console.log("ORDEN prev", order.products);
    // Actualizar la orden con los datos del pago
    await order.update({
      payment_id,
      merchant_order_id,
      status,
      preference_id,
      payment_type,
      processing_mode,
      site_id,
    });
    console.log("ORDEN post", order);
    // Actualizar el stock de los productos
    for (const product of order.products) {
      await updateProductStock(product.prodId, product.product_amount);
    }

    
    // Eliminar el carrito después de una compra exitosa
    await deleteAllCart(order.userId);
    
    // Renderizar la página de éxito
    res.redirect(`http://localhost:5173/success?payment_id=${payment_id}&status=${status}&merchant_order_id=${merchant_order_id}`);
    // res.send(`
    //   <!DOCTYPE html>
    //   <html>
    //     <head>
    //       <title>Pago Exitoso</title>
    //       <link rel="stylesheet" type="text/css" href="./payStyles/succes.css">
    //     </head>
    //     <body>
    //       <h1>¡Pago Exitoso!</h1>
    //       <p>ID del Pago: ${payment_id}</p>
    //       <p>Estado: ${status}</p>
    //       <p>ID de la Orden: ${merchant_order_id}</p>
    //     </body>
    //   </html>
    // `);

    
  } catch (error) {
    console.error("Error en /feedback/success:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// payRouter.post("/create_preference", async (req, res) => {
//   try {
  
//   //console.log("LLEGA PREFERENCIA", req.body);

//   // Extraer los datos correctamente
//   const products = req.body.preferencia; // Todos los elementos excepto el último
//   const { total_order_price, description, datos_Comprador } =
//     req.body.orderData;

//   //console.log("comprador", datos_Comprador);

//   let arrayProducts = products.map((prod) => ({
//     id: prod.prodId,
//     title: prod.product_description,
//     quantity: prod.product_amount,
//     unit_price: prod.product_unit_price,
//   }));

  
//     const user = await User.findOne({
//       where: { email: datos_Comprador.email },
//     });
//     //console.log("USUARIO", user);
//     const tieneCarrito = await Cart.findOne({ where: { cartUserId: user.id } });
//     //console.log("CARRITO", tieneCarrito);
//     const newOrder = await Order.create({
//       userId: user.id,
//       cartId: tieneCarrito.id,
//       buyer_email: user.email
//     }); 
//     //console.log("ORDEN", newOrder);

//   const instanciaPreferencia = new Preference(mercadopagoClient);

//   instanciaPreferencia
//     .create({
//       body: {
//         items: arrayProducts,
//         back_urls: {
//           success: `${process.env.BACK}/pay/feedback/success`,
//           failure: `${process.env.BACK}/pay/feedback/failure`,
//           pending: `${process.env.BACK}/pay/feedback/pending`,
//         },
//         external_reference: newOrder.id,
//         auto_return: "approved",
//         payer: {
//           phone: { area_code: "", number: datos_Comprador.phone },
//           email: datos_Comprador.email,
//           identification: { number: "", type: "" },
//           name: datos_Comprador.name,
//           surname: datos_Comprador.lastname,
//         },
//         shipments: {
//           default_shipping_method: null,
//           receiver_address: {
//             zip_code: "",
//             street_name: "",
//             street_number: null,
//             floor: "",
//             apartment: "",
//             city_name: datos_Comprador.city,
//             state_name: datos_Comprador.city,
//             country_name: datos_Comprador.country,
//           },
//         },
//       },
      
//     })
//     .then(function (response) {
//       //console.log("recibo preferencia", response);
//       res.status(200).json({ id: response.id }); // Asegúrate de devolver el ID de la preferencia
//     })
//     .catch(function (error) {
//       console.log(error);
//       res.status(500).send({ error: "Error al crear la preferencia" });
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// }
// );

// payRouter.get("/feedback/success", async function (req, res) {
//   console.log("FEEDBACK SUCCESS - Query Params:", req.query);

//   try {
//     const {
//       preference_id, // ID de la preferencia de MercadoPago
//       external_reference, // Referencia externa (puede ser el ID de la orden en tu sistema)
//       payment_id, // ID del pago en MercadoPago
//       status, // Estado del pago
//       merchant_order_id, // ID de la orden en MercadoPago
//     } = req.query;

//     // Validar que los parámetros necesarios estén presentes
//     if (!preference_id || !external_reference || !payment_id || !status || !merchant_order_id) {
//       throw new Error("Faltan parámetros necesarios en la solicitud");
//     }

//     // Obtener la preferencia de MercadoPago
//     const preference = new Preference(mercadopagoClient);
//     await preference.get( {preferenceId : preference_id});
//     console.log("Preferencia de MercadoPago:", preference);

//     // Buscar la orden en tu base de datos usando la referencia externa
//     const order = await Order.findOne({ where: { id: external_reference } });
//     if (!order) {
//       throw new Error(`No se encontró la orden con ID: ${external_reference}`);
//     }
//     console.log("Datos de la orden:", order);

//     // Actualizar el stock de los productos (si es necesario)
//     if (preference.items && Array.isArray(preference.items)) {
//       for (const item of preference.items) {
//         await updateProductStock(item.id, item.quantity);
//         console.log(`Se ha descontado ${item.quantity} unidades del producto ${item.id}`);
//       }
//     }

//     res.send(`
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <title>Mi página HTML</title>
//         <link rel="stylesheet" type="text/css" href="./payStyles/succes.css">
//       </head>
//       <body style="background-color: #232326; display: flex; margin-top: 80px; flex-direction: column; align-items: center;">
//         <div style="display: flex; flex-direction: column; align-items: center; text-align: center; border: 1px solid black; border-radius: 20px; background-color: #ffffff; padding: 20px;"">
//           <a style="margin-bottom: 10px;" href=${process.env.FRONT}><svg className='succes_svg' width="50px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path style="fill:#232326" d="M24 12.001H2.914l5.294-5.295-.707-.707L1 12.501l6.5 6.5.707-.707-5.293-5.293H24v-1z" data-name="Left"/></svg></a>
//           <h1 style="margin-bottom: 10px;" >Payment Successful</h1>
//           <img style="max-width: 100%; margin-bottom: 10px;" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_xXsXXnglKn4YmVFVx39Pd-0LgWqhiUVk5g&usqp=CAU" alt="" className='succes_img'>
//           <a style="margin-bottom: 10px;" href="${process.env.FRONT}/Products" className="succes_a">SEGUIR COMPRANDO</a>
//           <p style="margin-bottom: 10px;" className="succes_p">GATO NEGRO STORE</p>
//           <ul style="margin-bottom: 10px; list-style-type: none;" className="succes_ul">          
//             <li className="succes_li">Payment ID: ${payment_id}</li>
//             <li className="succes_li">Status: ${status}</li>
//             <li className="succes_li">Merchant Order ID: ${merchant_order_id}</li>
//           </ul>
//         </div>
//       </body>
//     </html>
//     `);

//     await deleteAllCart(); // Eliminar el carrito después de una compra exitosa
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

payRouter.get("/feedback/pending", async function (req, res) {
  try {
    const {
      payment_id: paymentId,
      status: statusId,
      merchant_order_id: merchantOrderId,
    } = req.query;
    const {
      product_description,
      total_order_price,
      prodId,
      buyer_email,
      product_name,
      product_image,
      product_amount,
      product_unit_price,
    } = arrayPreference;

    const newOrder = await postOrder(
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
    );
    //await enviarMail(product_description, total_order_price, buyer_email, statusId);
    await updateProductStock(prodId, product_amount);
    console.log("SE HA DESCONTADO", prodId, product_amount, "DEL STOCK");

    console.log(newOrder, "FEEDBACK PENDING ORDEN REGISTRADA OK");

    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Mi página HTML</title>
        <link rel="stylesheet" type="text/css" href="./payStyles/pending.css">
      </head>
      <body style="background-color: #232326; display: flex; margin-top: 80px; flex-direction: column; align-items: center;">
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; border: 1px solid black; border-radius: 20px; background-color: #ffffff; padding: 20px;"">
          <a style="margin-bottom: 10px;" href="${process.env.FRONT}/"><svg className='pending_svg' width="20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path style="fill:#232326" d="M24 12.001H2.914l5.294-5.295-.707-.707L1 12.501l6.5 6.5.707-.707-5.293-5.293H24v-1z" data-name="Left"/></svg></a>
          <h1 style="margin-bottom: 10px;" className="pending_h1"> PAGO PENDIENTE !</h1>
          <img style="max-width: 100%; margin-bottom: 10px;" className='pending_img'src="https://img.freepik.com/fotos-premium/simbolo-signo-exclamacion-azul-atencion-o-icono-signo-precaucion-fondo-problema-peligro-alerta-representacion-3d-senal-advertencia_256259-2831.jpg" alt="">
          <a style="margin-bottom: 10px;" className="pending_a" href="${process.env.FRONT}/Products">SIGUE COMPRANDO</a>
          <p style="margin-bottom: 10px;" className="pending_p">GATO NEGRO STORE</p>
        </div>
      </body>
    </html>
      `);
    await deleteAllCart(); // esto elimina el carrito al realizar una compra exitosa
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

payRouter.get("/feedback/failure", async function (req, res) {
  try {
    const {
      payment_id: paymentId,
      status: statusId,
      merchant_order_id: merchantOrderId,
    } = req.query;
    const {
      product_description,
      total_order_price,
      prodId,
      buyer_email,
      product_name,
      product_image,
      product_amount,
      product_unit_price,
    } = arrayPreference;

    const newOrder = await postOrder(
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
    );

    console.log(newOrder, "FEEDBACK FAILURE ORDEN REGISTRADA OK");

    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
      <title>Mi página HTML</title>
      <link rel="stylesheet" type="text/css" href="./payStyles/failure.css">
      </head>
      <body style="background-color: #232326; display: flex; margin-top: 80px; flex-direction: column; align-items: center;">
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; border: 1px solid black; border-radius: 20px; background-color: #ffffff; padding: 20px;"">
        <a style="margin-bottom: 10px;" href=${process.env.FRONT}><svg className='failure_svg' width="30px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path style="fill:#232326" d="M24 12.001H2.914l5.294-5.295-.707-.707L1 12.501l6.5 6.5.707-.707-5.293-5.293H24v-1z" data-name="Left"/></svg></a>
        <h1 style="margin-bottom: 10px;" className="failure_h1"> TU PAGO A FALLADO </h1>
        <img style="max-width: 100%; margin-bottom: 10px;" className="failure_img" src="https://static.vecteezy.com/system/resources/thumbnails/017/178/563/small/cross-check-icon-symbol-on-transparent-background-free-png.png" alt="">
        <a style="margin-bottom: 10px;" href="${process.env.FRONT}/Products" className="failure_a">INTENTALO NUEVAMENTE</a>
        <p style="margin-bottom: 10px;" className="failure_p">GATO NEGRO STORE</p>
      </div>
      </body>
  </html>
              `);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = { payRouter };
