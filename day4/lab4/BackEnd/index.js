const DB = require('./DB');
const express = require('express');
const app = express();
const port = 3000;

DB.connectDB();

const ProductRoute = require('./routes/productRoute');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/product', ProductRoute);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
