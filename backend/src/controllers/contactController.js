// ============================================================
// backend/src/controllers/contactController.js
// Lógica da rota POST /api/contact
// ============================================================

const { validationResult } = require("express-validator");
const emailService = require("../services/emailService");
const { success, error } = require("../utils/responses");
const logger = require("../utils/logger");

/**
 * POST /api/contact
 * Recebe os dados do formulário, valida e envia e-mail.
 */
async function sendContact(req, res) {
    // ============================================================
    // 1. VALIDAÇÃO
    // ============================================================
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));

        logger.warn(`Validação falhou: ${formattedErrors.length} erro(s)`);

        return error(res, 422, "Dados inválidos", formattedErrors);
    }

    // ============================================================
    // 2. EXTRAIR DADOS
    // ============================================================
    const {
        name = "",
        email = "",
        subject = "",
        message = "",
    } = req.body;

    // ============================================================
    // 3. ENVIAR E-MAILS
    // ============================================================
    try {
        logger.info(`Nova mensagem recebida de ${email}`);

        await emailService.sendContactEmails({
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim() || "Sem assunto",
            message: message.trim(),
        });

        logger.info(`Mensagem de ${email} processada com sucesso`);

        return success(
            res,
            200,
            "Mensagem enviada com sucesso! Responderei em breve."
        );
    } catch (err) {
        logger.error("Erro ao processar formulário de contato", err);

        return error(
            res,
            500,
            "Não foi possível enviar sua mensagem. Tente novamente em alguns minutos."
        );
    }
}

module.exports = {
    sendContact,
};