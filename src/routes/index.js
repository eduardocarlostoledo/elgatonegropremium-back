const { Router } = require('express');
const {productRouter} = require('./productRouter')
const {userRouter} = require("./userRouter.js")
const {cartRouter}=require("./cartRouter.js")
const {filterRouter} = require("./filterRouter")
const {payRouter} = require("./payRouter.js")
const {orderRouter} = require("./orderRouter.js")
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');


const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
router.use('/products', productRouter)
router.use('/users', userRouter)
router.use('/cart', cartRouter)
router.use('/filter',filterRouter)
router.use('/pay', payRouter)
router.use("/order", orderRouter)
// router.use('/users', userRouter)

module.exports = router;