import { connectDB } from "../../lib/db.js";
import Usuario from "../../models/Usuario.js";
import TokenReset from "../../models/TokenReset.js";
import { enviarEmailResetSenha } from "../../lib/email.js";

import crypto from "crypto";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    await connectDB();

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Informe o email." });
    }

    // 1. Verifica usuário
    const user = await Usuario.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // 2. Gera token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 1000 * 60 * 10; // 10 min

    // 3. Salva token
    await TokenReset.create({
      usuarioId: user._id,
      token,
      expiresAt,
      usado: false
    });

    // 4. Monta link final
    const link = `https://resetdesenha.grupolocar.com/troca-senha-grupo-locar/${token}`;

    // 5. Envia e-mail de recuperação
    await enviarEmailResetSenha(user.email, link);

    // 6. Retorno
    return res.json({
      message: "Um link para redefinir sua senha foi enviado para seu e-mail."
    });

  } catch (err) {
    console.error("❌ Erro no recuperar.js:", err);
    return res.status(500).json({ error: "Erro ao gerar token." });
  }
}
