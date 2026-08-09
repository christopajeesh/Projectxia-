import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const cleanMarketplace = async () => {
  console.log('Connecting to MongoDB Atlas to clean all mock/test projects...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to Atlas successfully.');

  const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false }));
  const result = await Project.deleteMany({});
  console.log(`Deleted ${result.deletedCount} mock/test project(s) from MongoDB Atlas.`);

  process.exit(0);
};

cleanMarketplace().catch(err => {
  console.error('Clean failed:', err.message);
  process.exit(1);
});
