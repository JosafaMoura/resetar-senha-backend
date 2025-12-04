import { connectDB } from "../../lib/db.js";
import Usuario from "../../models/Usuario.js";
import { enviarEmailSenhaAlterada } from "../../lib/email.js";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

  try {
    await connectDB();

    const { email, novaSenha } = req.body || {};

    if (!email || !novaSenha) {
      return res.status(400).json({ error: "Informe email e nova senha." });
    }

    const user = await Usuario.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // altera senha
    await user.setSenha(novaSenha);
    await user.save();

    // envia email opcional
    try {
      await enviarEmailSenhaAlterada(user.email);
    } catch (e) {
      console.error("⚠️ Email de confirmação falhou (mas a senha foi trocada)");
    }

    return res.json({ message: "Senha redefinida com sucesso." });

  } catch (err) {
    console.error("❌ Erro ao redefinir senha:", err);
    return res.status(500).json({ error: "Erro ao redefinir senha." });
  }
}
