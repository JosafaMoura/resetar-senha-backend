import nodemailer from "nodemailer";

/* ============================================================
   CONFIG SMTP HOSTINGER
=============================================================== */
export const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/* ============================================================
   FUNÇÃO: Enviar e-mail de recuperação de senha
=============================================================== */
export async function enviarEmailResetSenha(email, link) {
  try {
    await emailTransporter.sendMail({
      from: `"Grupo Locar" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Recuperação de Senha - Grupo Locar",
      html: `
        <h2>Recuperação de Senha</h2>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>

        <p>Clique no botão abaixo para redefinir:</p>
        <p>
          <a href="${link}"
            style="display:inline-block;padding:10px 15px;background:#007bff;color:#fff;text-decoration:none;border-radius:6px"
            target="_blank">
            Redefinir Senha
          </a>
        </p>

        <p>Se você não pediu isso, ignore este e-mail.</p>
        <br>
        <small>Este link expira em 10 minutos.</small>
      `
    });

    console.log("📧 Email de recuperação enviado →", email);
  } catch (err) {
    console.error("❌ ERRO ao enviar email de reset de senha:", err);
  }
}

/* ============================================================
   FUNÇÃO: Enviar e-mail de senha alterada com sucesso
=============================================================== */
export async function enviarEmailSenhaAlterada(email) {
  try {
    await emailTransporter.sendMail({
      from: `"Grupo Locar" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Senha alterada com sucesso - Grupo Locar",
      html: `
        <h2>Senha atualizada</h2>
        <p>Olá,</p>
        <p>A senha da sua conta foi alterada com sucesso.</p>

        <p>Se não foi você, recomendamos alterar imediatamente sua senha.</p>
        <br>
        <small>Equipe Grupo Locar</small>
      `
    });

    console.log("📧 Email de senha alterada enviado →", email);
  } catch (err) {
    console.error("❌ ERRO ao enviar email de senha alterada:", err);
  }
}
