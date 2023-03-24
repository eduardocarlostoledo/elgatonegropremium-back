const { Order } = require("../db");
const { Router } = require('express');
const orderRouter = Router()
const { postOrder, getOrders } = require("../controllers/orderControllers")

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
    
orderRouter.post('/', async (req,res) => {
    try {
        console.log("REQ.BODY POST CART", req.body)
        const { cartUserId, paymentId, statusId, merchantOrderId } = req.body;
        const newOrder = await postOrder(cartUserId, paymentId, statusId, merchantOrderId)
        res.status(200).json(newOrder)
    } catch (error) {
        res.status(400).json(error.message) 
    }
})

orderRouter.get('/', async (req,res) => {   
    
    try {
        const response = await getOrders();
        res.status(201).send(response);   
    } catch (error) {
        res.status(400).json("Error Handler Get Order")   

    }
    
    
});  

module.exports = { orderRouter };