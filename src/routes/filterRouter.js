const { Router } = require('express');
const {filterByPage} = require('../controllers/filterController')


const filterRouter = Router()


filterRouter.get('/', async (req,res) => {
    try {
        const result = req.query.page ? await filterByPage(req.query.page, req.query.type, req.query.brand, req.query.price) : await filterByPage(1,req.query.type, req.query.brand, req.query.price)
        result.length == 0 ? res.status(404).json("There's no products in the specified page") : res.status(200).json(result)
    } catch (error) {
        res.status(404).json(error.message)
    }
})


module.exports = {filterRouter}