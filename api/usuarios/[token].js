import { connectDB } from "../../lib/db.js";
import TokenReset from "../../models/TokenReset.js";
import Usuario from "../../models/Usuario.js";
import { enviarEmailSenhaAlterada } from "../../lib/email.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

  try {
    await connectDB();

    let { token } = req.query;
    const { novaSenha } = req.body || {};

    if (!novaSenha) return res.status(400).json({ error: "Informe a nova senha." });

    if (token.endsWith("/")) token = token.slice(0, -1);

    const t = await TokenReset.findOne({ token });

    if (!t || t.usado || t.expiresAt < Date.now()) {
      return res.status(400).json({ error: "Token inválido ou expirado." });
    }

    const u = await Usuario.findById(t.usuarioId);

    await u.setSenha(novaSenha);
    await u.save();

    t.usado = true;
    await t.save();

    await enviarEmailSenhaAlterada(u.email);

    return res.json({ message: "Senha redefinida com sucesso." });

  } catch (err) {
    console.error("❌ Erro ao redefinir senha:", err);
    return res.status(500).json({ error: "Erro ao redefinir senha." });
  }
}
