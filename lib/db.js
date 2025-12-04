import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;

  if (!uri) {
    console.error("MONGODB_URI não configurado.");
    throw new Error("MONGODB_URI não configurado.");
  }

  try {
    await mongoose.connect(uri, dbName ? { dbName } : {});
    isConnected = true;
    console.log("✅ MongoDB conectado (Vercel).");
  } catch (err) {
    console.error("❌ Erro ao conectar MongoDB:", err);
    throw err;
  }
}
