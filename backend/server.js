// ============================================================
// backend/server.js
// Ponto de entrada do servidor Express
// ============================================================

const express = require("express");
const cors = require("cors");
const path = require("path");

const config = require("./src/config");
const logger = require("./src/utils/logger");
const routes = require("./src/routes");
const { notFoundHandler, errorHandler } = require("./src/middlewares/errorHandler");

// ============================================================
// INICIALIZAÇÃO
// ============================================================

const app = express();

// Confia no proxy do Render (necessário para IP real e rate limit)
app.set("trust proxy", 1);

// ============================================================
// MIDDLEWARES GLOBAIS
// ============================================================

// CORS — permite que o frontend chame a API
app.use(
    cors({
        origin: (origin, callback) => {
            // Permite requisições sem origin (ex.: Postman, curl, mobile apps)
            if (!origin) return callback(null, true);

            if (config.cors.allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            logger.warn(`CORS bloqueado para origem: ${origin}`);
            return callback(new Error("Origem não permitida pelo CORS"));
        },
        credentials: true,
    })
);

// Parser de JSON (limite de 1MB para o body)
app.use(express.json({ limit: "1mb" }));

// Parser de URL encoded (formulários HTML)
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ============================================================
// LOG DE REQUISIÇÕES (apenas em desenvolvimento)
// ============================================================

if (config.server.isDevelopment) {
    app.use((req, res, next) => {
        logger.info(`${req.method} ${req.originalUrl}`);
        next();
    });
}

// ============================================================
// ROTAS DA API
// ============================================================

app.use("/api", routes);

// ============================================================
// ARQUIVOS ESTÁTICOS (frontend)
// ============================================================

const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

// ============================================================
// TRATAMENTO DE ERROS
// ============================================================

// 404 — rotas não encontradas na API
app.use("/api", notFoundHandler);

// SPA fallback — qualquer outra rota devolve o index.html
// (exceto rotas /api, que já foram tratadas acima)
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Handler global de erros (sempre por último)
app.use(errorHandler);

// ============================================================
// START DO SERVIDOR
// ============================================================

const PORT = config.server.port;

app.listen(PORT, "0.0.0.0", () => {
    logger.info(`🚀 Servidor rodando na porta ${PORT}`);
    logger.info(`📍 Ambiente: ${config.server.env}`);
    logger.info(`🌐 Frontend: ${frontendPath}`);
    logger.info(`🔗 API: http://localhost:${PORT}/api`);
});