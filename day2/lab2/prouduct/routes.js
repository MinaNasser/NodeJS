// routes.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const productsFilePath = path.join(__dirname, 'products.json');

function loadProducts() {
  const data = fs.readFileSync(productsFilePath, 'utf8');
  return JSON.parse(data);
}

function saveProducts(products) {
  fs.writeFileSync(productsFilePath, JSON.stringify({ products }, null, 2));
}


router.get('/products', (req, res) => {
  const products = loadProducts().products;
  res.json(products);
});


router.get('/addproduct/:name/:price', (req, res) => {
  const { name, price } = req.params;  
  const products = loadProducts().products;

  const newProduct = { name, price: parseFloat(price) };
  products.push(newProduct);

  saveProducts(products);

  res.send(`Product added: ${name} with price: ${price}`);
});

router.get('/productsearch/:name', (req, res) => {
  const name = req.params.name.toLowerCase();
  const products = loadProducts().products;
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(name)
  );

  res.json(filteredProducts);
});


router.get('/product/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const products = loadProducts().products;

  if (index >= 0 && index < products.length) {
    res.json(products[index]);
  } else {
    res.status(404).send('Product not found');
  }
});

router.get('/delete-product/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const products = loadProducts().products;

  if (index >= 0 && index < products.length) {
    products.splice(index, 1);
    saveProducts(products);
    res.send('Product deleted successfully');
  } else {
    res.status(404).send('Product not found');
  }
});

router.get('/update-product/:index/:name/:price', (req, res) => {
  const index = parseInt(req.params.index);
  const { name, price } = req.params;  
  const products = loadProducts().products;

  if (index >= 0 && index < products.length) {
    products[index] = { name, price: parseFloat(price) };
    saveProducts(products);
    res.send('Product updated successfully');
  } else {
    res.status(404).send('Product not found');
  }
});

module.exports = router;
