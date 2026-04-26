const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const makeAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOneAndUpdate(
            { email },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`User ${email} is now an ADMIN.`);
        } else {
            console.log(`User with email ${email} not found.`);
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

const email = process.argv[2];
if (!email) {
    console.log('Please provide an email: node makeAdmin.js user@example.com');
    process.exit(1);
}

makeAdmin(email);
