// ============================================================
// backend/src/middlewares/errorHandler.js
// Tratamento global de erros da aplicação
// ============================================================

const config = require("../config");
const logger = require("../utils/logger");

/**
 * Middleware de rotas não encontradas (404).
 * Executado quando nenhuma rota anterior casou com a URL.
 */
function notFoundHandler(req, res, next) {
    logger.warn(`Rota não encontrada: ${req.method} ${req.originalUrl}`);

    return res.status(404).json({
        success: false,
        message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    });
}

/**
 * Middleware global de tratamento de erros.
 *
 * IMPORTANTE: precisa ter 4 parâmetros (err, req, res, next)
 * para o Express reconhecer como error handler.
 */
function errorHandler(err, req, res, next) {
    // ============================================================
    // 1. LOG DO ERRO
    // ============================================================
    logger.error(
        `Erro em ${req.method} ${req.originalUrl} — ${err.message}`,
        err
    );

    // ============================================================
    // 2. DETERMINAR STATUS CODE
    // ============================================================
    const statusCode = err.status || err.statusCode || 500;

    // ============================================================
    // 3. MONTAR RESPOSTA
    // ============================================================
    const response = {
        success: false,
        message: err.message || "Erro interno do servidor",
    };

    // Em desenvolvimento, inclui o stack trace para facilitar o debug.
    // Em produção, NUNCA expõe detalhes internos.
    if (config.server.isDevelopment && err.stack) {
        response.stack = err.stack;
    }

    // ============================================================
    // 4. ENVIAR RESPOSTA
    // ============================================================
    return res.status(statusCode).json(response);
}

module.exports = {
    notFoundHandler,
    errorHandler,
};