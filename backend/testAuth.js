const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'admin@lms.com';
        const password = 'admin123';
        
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('TEST: User not found');
        } else {
            const isMatch = await user.matchPassword(password);
            console.log('TEST: Password Match:', isMatch);
        }
        process.exit();
    } catch (err) {
        console.error('TEST_ERROR:', err.message);
        process.exit();
    }
};

testLogin();
