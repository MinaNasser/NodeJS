const mongoose = require('mongoose');   
const ConnectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/NodeJS',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        );
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}
module.exports = {ConnectDB};