import { connectDB } from "../../../lib/db.js";
import TokenReset from "../../../models/TokenReset.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido." });

  try {
    await connectDB();

    let { token } = req.query;

    if (token.endsWith("/")) token = token.slice(0, -1);

    const t = await TokenReset.findOne({ token });

    const valido = !!t && !t.usado && t.expiresAt > Date.now();

    return res.json({ valido });

  } catch (err) {
    console.error("❌ Erro ao validar token:", err);
    return res.status(500).json({ error: "Erro ao validar token." });
  }
}
