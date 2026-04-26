const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const createTempAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@lms.com';
        await User.deleteOne({ email: adminEmail });

        await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: 'admin123',
            role: 'admin'
        });
        console.log('Temp Admin created successfully!');

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err.message);
    }
};

createTempAdmin();
