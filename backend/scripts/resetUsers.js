import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://theprojectxia_db_user:projectxia123@cluster0.wjvvvha.mongodb.net/projectxia?retryWrites=true&w=majority';

async function resetAllUsers() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas successfully.');

    const userCountBefore = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`\n📋 Current users in database: ${userCountBefore}`);

    // Delete all users
    const result = await mongoose.connection.db.collection('users').deleteMany({});
    console.log(`\n🗑️ Deleted ${result.deletedCount} user record(s) from 'users' collection.`);

    const userCountAfter = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`✨ Database reset complete. Users remaining: ${userCountAfter}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas. Clean slate ready for fresh user registrations!');
  } catch (err) {
    console.error('❌ Error during user reset:', err.message);
  }
}

resetAllUsers();
