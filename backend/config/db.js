import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Windows ISP DNS blocking MongoDB Atlas SRV lookups
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {}
}

let isConnected = false;
let useMemoryFallback = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/projectxia';

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    useMemoryFallback = false;
    console.log(`[ProjectXia Shield] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[ProjectXia Shield] Local MongoDB not reachable (${error.message}).`);
    console.log(`[ProjectXia Shield] Activating zero-latency In-Memory Resilient Data Store fallback.`);
    useMemoryFallback = true;
    return null;
  }
};

export const getDBStatus = () => ({
  isConnected,
  useMemoryFallback,
  mode: useMemoryFallback ? 'Resilient Hybrid In-Memory Store' : 'Active MongoDB Cluster',
});
