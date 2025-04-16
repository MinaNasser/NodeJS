const Product = require('../Models/Product');

const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching products.' });
        console.log(error);
    }

};
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the product.' });
    }
};
const createProduct = async (req, res) => {
    try {
        const { name, price, quantity } = req.body;
        const product = new Product({ name, price, quantity });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the product.' });
    }
};
const updateProduct = async (req, res) => {
    try {
        const { name, price, quantity } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { name, price, quantity },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the product.' });
    }
};
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the product.' });
    }
};
module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};

