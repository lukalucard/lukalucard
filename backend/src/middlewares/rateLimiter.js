// ============================================================
// backend/src/middlewares/rateLimiter.js
// Middleware de rate limiting (anti-spam)
// ============================================================

const rateLimit = require("express-rate-limit");
const config = require("../config");
const logger = require("../utils/logger");

/**
 * Rate limiter específico para o formulário de contato.
 *
 * Regra: máximo de X requisições por IP dentro da janela de tempo.
 * Padrão: 5 mensagens por hora por IP.
 */
const contactLimiter = rateLimit({
    // Janela de tempo em ms (configurada no .env)
    windowMs: config.rateLimit.windowMs,

    // Máximo de requisições por IP dentro da janela
    max: config.rateLimit.max,

    // Cabeçalhos padrão (RateLimit-*)
    standardHeaders: true,

    // Desabilita o cabeçalho legado X-RateLimit-* (depreciado)
    legacyHeaders: false,

    // Mensagem customizada quando o limite é atingido
    message: {
        success: false,
        message:
            "Muitas mensagens enviadas. Aguarde uma hora antes de tentar novamente.",
    },

    // Callback executado quando o limite é atingido
    handler: (req, res, next, options) => {
        logger.warn(
            `Rate limit atingido para o IP ${req.ip} na rota ${req.originalUrl}`
        );

        res.status(options.statusCode).json(options.message);
    },

    // Usa o IP real do cliente (importante atrás de proxies como o Render)
    // O Render usa proxies, então precisamos confiar no X-Forwarded-For
    validate: {
        trustProxy: false, // Silencia warning quando trust proxy não está configurado
    },
});

module.exports = {
    contactLimiter,
};