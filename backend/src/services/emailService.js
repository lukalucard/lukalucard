// ============================================================
// backend/src/services/emailService.js
// Serviço de envio de e-mail via Resend (SMTP + Nodemailer)
// ============================================================

const nodemailer = require("nodemailer");
const config = require("../config");
const logger = require("../utils/logger");

/**
 * Transporter do Nodemailer configurado para o Resend.
 * Criado uma vez e reutilizado (evita reconectar a cada envio).
 */
const transporter = nodemailer.createTransport({
    host: "smtp.resend.com",
    port: 465,
    secure: true, // SSL
    auth: {
        user: "resend", // usuário fixo do Resend
        pass: config.email.apiKey,
    },
});

/**
 * Escapa caracteres HTML para prevenir injeção.
 * Usado nos templates de e-mail.
 */
function escapeHtml(text) {
    if (typeof text !== "string") return "";

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Monta o HTML do e-mail de notificação (que chega pra você).
 */
function buildNotificationHtml({ name, email, subject, message }) {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4;">
            <div style="background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <h2 style="color: #00c8ff; margin-top: 0;">📬 Nova mensagem no portfólio</h2>

                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

                <p><strong>Nome:</strong> ${safeName}</p>
                <p><strong>E-mail:</strong> ${safeEmail}</p>
                <p><strong>Assunto:</strong> ${safeSubject}</p>

                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

                <p><strong>Mensagem:</strong></p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; line-height: 1.6;">
                    ${safeMessage}
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

                <p style="font-size: 12px; color: #999;">
                    Responda diretamente este e-mail para falar com ${safeName}.
                </p>
            </div>
        </div>
    `;
}

/**
 * Monta o HTML da auto-resposta (que o visitante recebe).
 */
function buildAutoReplyHtml({ name }) {
    const safeName = escapeHtml(name);

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4;">
            <div style="background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <h2 style="color: #00c8ff; margin-top: 0;">Olá, ${safeName}!</h2>

                <p style="line-height: 1.6;">
                    Recebi sua mensagem e vou responder o mais rápido possível.
                </p>

                <p style="line-height: 1.6;">
                    Este é um e-mail automático — <strong>não precisa responder</strong>.
                </p>

                <p style="line-height: 1.6;">
                    Enquanto isso, você pode:
                </p>

                <ul style="line-height: 1.8;">
                    <li>Visitar meu <a href="https://lukalucard.onrender.com" style="color: #00c8ff;">portfólio</a></li>
                    <li>Ver meus projetos no <a href="https://github.com/lukalucard" style="color: #00c8ff;">GitHub</a></li>
                    <li>Conectar no <a href="https://www.linkedin.com/in/luiz-carlos-sim%C3%A3o-dos-santos-085a14310/" style="color: #00c8ff;">LinkedIn</a></li>
                </ul>

                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

                <p style="color: #666;">
                    Abraço,<br>
                    <strong>Luka Lucard</strong>
                </p>
            </div>
        </div>
    `;
}

/**
 * Envia o e-mail de notificação pra você (o dono do site).
 */
async function sendNotification({ name, email, subject, message }) {
    const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to: config.email.to,
        replyTo: email, // se você responder, vai direto pro visitante
        subject: `📬 Nova mensagem: ${subject}`,
        html: buildNotificationHtml({ name, email, subject, message }),
    };

    return transporter.sendMail(mailOptions);
}

/**
 * Envia a auto-resposta pro visitante.
 */
async function sendAutoReply({ name, email }) {
    const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to: email,
        subject: "Recebi sua mensagem! 🚀",
        html: buildAutoReplyHtml({ name }),
    };

    return transporter.sendMail(mailOptions);
}

/**
 * Envia os e-mails (notificação + auto-resposta).
 * Não falha se a auto-resposta falhar — a notificação é o essencial.
 */
async function sendContactEmails({ name, email, subject, message }) {
    const results = {
        notification: null,
        autoReply: null,
        notificationError: null,
        autoReplyError: null,
    };

    // 1) Notificação (essencial)
    try {
        results.notification = await sendNotification({ name, email, subject, message });
        logger.info(`Notificação enviada para ${config.email.to}`);
    } catch (err) {
        results.notificationError = err.message;
        logger.error("Falha ao enviar notificação", err);
        throw err; // Propaga — sem isso, o formulário não funciona
    }

    // 2) Auto-resposta (opcional — se falhar, não quebra o fluxo)
    try {
        results.autoReply = await sendAutoReply({ name, email });
        logger.info(`Auto-resposta enviada para ${email}`);
    } catch (err) {
        results.autoReplyError = err.message;
        logger.warn(`Falha ao enviar auto-resposta para ${email}: ${err.message}`);
    }

    return results;
}

module.exports = {
    sendContactEmails,
};