// ============================================================
// backend/src/utils/responses.js
// Respostas padronizadas da API (sucesso e erro)
// ============================================================

/**
 * Resposta de sucesso padronizada
 *
 * @param {Object} res        - Objeto response do Express
 * @param {number} statusCode - Código HTTP (default: 200)
 * @param {string} message    - Mensagem legível
 * @param {*}      data       - Dados a retornar (opcional)
 */
function success(res, statusCode = 200, message = "Sucesso", data = null) {
    const response = {
        success: true,
        message,
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
}

/**
 * Resposta de erro padronizada
 *
 * @param {Object} res        - Objeto response do Express
 * @param {number} statusCode - Código HTTP (default: 400)
 * @param {string} message    - Mensagem legível
 * @param {Array}  errors     - Lista de erros específicos (opcional)
 */
function error(res, statusCode = 400, message = "Erro", errors = null) {
    const response = {
        success: false,
        message,
    };

    if (errors !== null && Array.isArray(errors) && errors.length > 0) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
}

module.exports = {
    success,
    error,
};