
const mongoose = require('mongoose');

//fields (ID, Name, Price, and Quantity).
const ProductSchema = mongoose.Schema({
    name: 
    {
        type: String, required: [true, 'Name is required']
    },
    price: 
    {
        type: Number, 
        required: [true, 'Price is required']
    },
    quantity: 
    {
        type: Number,
         required: [true, 'Quantity is required']
    },

}, {
    strict: false,
    timestamps: true
})


const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;