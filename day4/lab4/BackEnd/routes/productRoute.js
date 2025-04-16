const Product = require('../Models/Product');
const route = require('express').Router();
const productController = require('../controllers/ProductController');

route.get('/api/products', productController.getProducts);
route.get('/api/products/:id', productController.getProductById);
route.post('/api/products', productController.createProduct);
route.put('/api/products/:id', productController.updateProduct);
route.delete('/api/products/:id', productController.deleteProduct);



module.exports = route;

