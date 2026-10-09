// ============================================================
// backend/src/controllers/contactController.js
// Lógica da rota POST /api/contact
// Salva no banco + envia e-mails
// ============================================================

const { validationResult } = require("express-validator");
const emailService = require("../services/emailService");
const prisma = require("../config/prismaClient");
const { success, error } = require("../utils/responses");
const logger = require("../utils/logger");

/**
 * Extrai o IP real do visitante (considerando proxies como o Render).
 */
function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket?.remoteAddress || null;
}

/**
 * POST /api/contact
 * Recebe os dados do formulário, valida, salva no banco e envia e-mail.
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

    const cleanData = {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || null,
        message: message.trim(),
    };

    const clientInfo = {
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"] || null,
    };

    // ============================================================
    // 3. SALVAR NO BANCO (antes de enviar e-mail)
    // ============================================================
    let contact;
    try {
        contact = await prisma.contact.create({
            data: {
                ...cleanData,
                ipAddress: clientInfo.ipAddress,
                userAgent: clientInfo.userAgent,
                emailSent: false,
            },
        });

        logger.info(`Mensagem #${contact.id} salva no banco (de ${email})`);
    } catch (err) {
        logger.error("Erro ao salvar mensagem no banco", err);

        // Não conseguimos nem salvar — retorna erro 500
        return error(
            res,
            500,
            "Não foi possível enviar sua mensagem. Tente novamente em alguns minutos."
        );
    }

    // ============================================================
    // 4. ENVIAR E-MAILS
    // ============================================================
    try {
        await emailService.sendContactEmails({
            name: cleanData.name,
            email: cleanData.email,
            subject: cleanData.subject || "Sem assunto",
            message: cleanData.message,
        });

        // Atualiza o contato: e-mail enviado com sucesso
        await prisma.contact.update({
            where: { id: contact.id },
            data: { emailSent: true },
        });

        logger.info(`E-mails enviados com sucesso para mensagem #${contact.id}`);

        return success(
            res,
            200,
            "Mensagem enviada com sucesso! Responderei em breve."
        );
    } catch (err) {
        logger.error(
            `Falha ao enviar e-mail (mensagem #${contact.id})`,
            err
        );

        // Atualiza o contato: registra o erro do envio
        try {
            await prisma.contact.update({
                where: { id: contact.id },
                data: {
                    emailSent: false,
                    emailError: err.message || "Erro desconhecido",
                },
            });
        } catch (updateErr) {
            logger.error(
                `Falha ao atualizar status do e-mail (mensagem #${contact.id})`,
                updateErr
            );
        }

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