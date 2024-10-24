const { Router } = require('express');
const jwt = require('jsonwebtoken');

const { 
    getProductsCart,
    addProductCart,
    deleteProductCart,
    deleteAllCart,
    getCarritoDeUsuario,
} = require('../controllers/cartController')

const { Cart,Product } = require("../db");
const { verificaToken } = require('../helpers/verificaToken');

const cartRouter = Router()

cartRouter.get('/', async (req,res) => {
    try {
        const productsCart = await getProductsCart()
        res.status(200).json(productsCart)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

cartRouter.post('/', async (req,res) => {
    try {
    //console.log(req.body)
    const result = await addProductCart(req.body);
    res.status(200).json(result);
    } catch (error) {
        res.status(400).json(error.message) 
    }
})

cartRouter.delete('/:prodId', async (req,res) => {
    console.log("delete id", req.params)
    try {
        const deleteProduct = await deleteProductCart(req.params.prodId)
        res.status(200).json(deleteProduct)
    } catch (error) {
        res.status(400).json(error.message) 
    }
})


cartRouter.delete('/deletecart', async (req, res) => {
    console.log("delete cart")

    try {
      /* Eliminar todo el contenido del carrito */
      await Cart.destroy({ where: {} });
  
      /* Actualizar la columna 'inCart' de todos los productos a false */
      await Product.update({ inCart: false }, { where: {} });
  
      /* Devolver una respuesta exitosa */
      return res.status(200).json({ message: 'El carrito ha sido eliminado' });
    } catch (error) {
        res.status(400).json(error.message) 
    }
  });

  cartRouter.get("/getcartclient/:userId",verificaToken, async(req, res) =>{
    try {               
    const token = req.headers['authorization']?.split(' ')[1];
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    console.log("asd",decoded)
        
        const carritoCliente = await getCarritoDeUsuario(decoded.userId)
        res.status(200).json(carritoCliente);
    } catch (error) {
        res.status(400).json({ error: error.message });

    }
  })

module.exports={cartRouter};