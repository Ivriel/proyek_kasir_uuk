const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/userModel');

async function hashAdminPassword() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/your_database_name', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Find the admin user
        const adminUser = await User.findOne({ username: 'adminUser' });
        
        if (!adminUser) {
            console.log('Admin user not found');
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('adminPass', 10);

        // Update the user with hashed password
        adminUser.password = hashedPassword;
        await adminUser.save();

        console.log('Admin password has been successfully hashed and updated');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

hashAdminPassword(); 