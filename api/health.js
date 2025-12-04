import { connectDB } from "../lib/db.js";

export default async function handler(_req, res) {
  try {
    await connectDB();
    return res.json({
      ok: true,
      time: new Date().toISOString(),
      db: process.env.DB_NAME || null
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Erro ao conectar na base." });
  }
}
