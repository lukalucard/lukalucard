// ============================================================
// backend/src/utils/logger.js
// Logger simples com timestamp e níveis (info, warn, error)
// ============================================================

/**
 * Formata a data/hora atual como "DD/MM/YYYY HH:mm:ss"
 */
function getTimestamp() {
    const now = new Date();

    const pad = (n) => String(n).padStart(2, "0");

    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const year = now.getFullYear();
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

const logger = {
    /**
     * Informação geral (ex.: servidor iniciado, requisição recebida)
     */
    info(message) {
        console.log(`[${getTimestamp()}] [INFO]  ${message}`);
    },

    /**
     * Aviso (ex.: algo suspeito mas não crítico)
     */
    warn(message) {
        console.warn(`[${getTimestamp()}] [WARN]  ${message}`);
    },

    /**
     * Erro (ex.: falha ao enviar e-mail, exceção)
     */
    error(message, err = null) {
        console.error(`[${getTimestamp()}] [ERROR] ${message}`);

        if (err) {
            if (err.stack) {
                console.error(err.stack);
            } else {
                console.error(err);
            }
        }
    },
};

module.exports = logger;