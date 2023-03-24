const { Router } = require('express');
const { postProduct,
  getProducts,
  getProductName,
  getProductsByName,
  getBrandProducts,
  getTypeProducts,
  BuildSearch,
  putReview,
  putProduct,
  banOrUnban,
  getProductsForAdmin,
  getProductsByNameForAdmin
  } = require('../controllers/productController')

const productRouter = Router()


// Ruta POST de Productos, va a ser utilizada por el administrador.



productRouter.post('/', async (req,res) => {
  try {
    let product = req.body;
    console.log(product);
    const newProduct = await postProduct(product,req.files.image);
    res.status(201).send({ status: "OK", data: newProduct });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

productRouter.put('/:id', async (req,res) => {
  let image=false;
  if(req.files) image =req.files.image;
  try {
    const updateProduct = await putProduct(req.params.id,req.body,image);
    res.status(201).send(updateProduct);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});
  

// Ruta GET para traer todos los tipos de productos.

// productRouter.get("/types", async (req, res) => {
//   try {
//       const products = await getTypeProducts();
//     res.status(200).json({ data: products});
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

productRouter.get("/BuildSearch", async (req, res) => {
  try {
    const {socket,type} = req.query
    console.log(socket,type);
    const products = await BuildSearch(socket,type);
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

productRouter.get("/types", async (req, res) => {
  try {
    const products = await getTypeProducts();
    res.status(200).json(products); //cambio el retorno para q sea mas limpio dejo copia arriba
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* Ruta post para types */
productRouter.post("/types", async (req, res) => {
  const {name} = req.body;
  try {   
    const postProducts = await Type.findOrCreate({name});
    res.status(200).json(postProducts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Ruta GET para traer todos las marcas de productos.

// productRouter.get("/brands", async (req, res) => {
//   try {
//       const products = await getBrandProducts();
//     res.status(200).json({ data: products});
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

productRouter.get("/brands", async (req, res) => {
  try {   
    const products = await getBrandProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

productRouter.post("/brands", async (req, res) => {
  const {name} = req.body;
  try {   
    const postProducts = await Brand.findOrCreate({name});
    res.status(200).json(postProducts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


//Ruta GET de productos, trae todos los productos si no tiene query y si tiene query de "name" busca los productos por su nombre
// en caso de no encontrar nombre de ese producto, devuelve todos. (Ruta para el buscador)

productRouter.get("/", async (req, res) => {
  try {
    let products = req.query.name ? await getProductsByName(req.query.name) : await getProducts()
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

productRouter.get("/ForAdmin", async (req, res) => {
  try {
    let products = req.query.name ?  await getProductsByNameForAdmin(req.query.name) : await getProductsForAdmin() 
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Ruta GET de productos por Name, busca el producto con un nombre exactamente igual al que recibe por parametro. (Ruta para el detail)

  productRouter.get("/:name", async (req, res) => {
    try {
      const result = await getProductName(req.params.name);
      result.length > 0 ? res.status(200).json({ data: result, message: "Producto solicitado" }) : res.status(404).json({ error: "Producto no encontrado" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
//ruta para añadir review
productRouter.put("/review/:id", async (req, res) =>{
  try {
    const {id}=req.params;
    const result= await putReview(id,req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error.message)
  }
})

productRouter.put("/ban/:id", async (req, res) =>{
  try {
    const {id}=req.params;
    const result= await banOrUnban(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error.message)
  }
})

module.exports = {productRouter}