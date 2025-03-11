const { Order } = require("../db");
const { Router } = require("express");
const orderRouter = Router();
const {
  postOrder,
  getOrders,
  getOrdersByUser,
} = require("../controllers/orderControllers");
const { verificaToken } = require("../helpers/verificaToken");
const { verifyAdmin } = require("../helpers/verifyAdmin");

// orderRouter.post('/', async (req,res) => {
//     try {
//         console.log("REQ.BODY POST CART", req.body)
//         const newOrder=await postOrder(req.body)
//         res.status(200).json(newOrder)
//     } catch (error) {
//         res.status(400).json(error.message)
//     }
// })

/* Este post crea los orders por Insomia, después que se crean algunos, 
    comenten este post y descomenten el de arriba que funciona con payRouter*/

orderRouter.post("/", async (req, res) => {
  try {
    console.log("REQ.BODY POST CART", req.body);
    const { cartUserId, paymentId, statusId, merchantOrderId } = req.body;
    const newOrder = await postOrder(
      cartUserId,
      paymentId,
      statusId,
      merchantOrderId
    );
    res.status(200).json(newOrder);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

orderRouter.get("/", verificaToken, verifyAdmin, async (req, res) => {
  console.log("solicitando ruta /getorder");
  try {
    const response = await getOrders();

    res.status(201).json(response);
  } catch (error) {
    res.status(400).json("Error Handler Get Order");
  }
});

//se solicitan todas las ordenes del cliente
orderRouter.get("/getorderclient/:userId", async (req, res) => {
  console.log("1 getorderclient /getorderclient/:userId", req.params.userId);
  const { userId } = req.params;
  try {
    const response = await getOrdersByUser(userId);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json("Error Handler Get Order");
  }
});

module.exports = { orderRouter };
