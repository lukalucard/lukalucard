// ============================================================
// backend/server.js
// Ponto de entrada do servidor Express
// ============================================================

const express = require("express");
const cors = require("cors");
const path = require("path");

const config = require("./src/config");
const logger = require("./src/utils/logger");
const prisma = require("./src/config/prismaClient");
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

// Parser de JSON
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Log de requisições (apenas em desenvolvimento)
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
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Handler global de erros (sempre por último)
app.use(errorHandler);

// ============================================================
// START DO SERVIDOR
// ============================================================

const PORT = config.server.port;

// Testa a conexão com o banco ANTES de subir o servidor
async function testDatabaseConnection() {
    try {
        await prisma.$connect();
        logger.info("🗄️  Conexão com o banco de dados estabelecida");
    } catch (err) {
        logger.error("❌ Falha ao conectar no banco de dados", err);
        process.exit(1);
    }
}

// Inicia o servidor
async function start() {
    await testDatabaseConnection();

    const server = app.listen(PORT, "0.0.0.0", () => {
        logger.info(`🚀 Servidor rodando na porta ${PORT}`);
        logger.info(`📍 Ambiente: ${config.server.env}`);
        logger.info(`🌐 Frontend: ${frontendPath}`);
        logger.info(`🔗 API: http://localhost:${PORT}/api`);
    });

    // ============================================================
    // GRACEFUL SHUTDOWN
    // ============================================================
    // Fecha o servidor e a conexão com o banco quando receber
    // sinal de desligamento (Ctrl+C, SIGTERM do Render, etc.)

    const shutdown = async (signal) => {
        logger.info(`📴 Recebido ${signal}. Desligando...`);

        // Para de aceitar novas requisições
        server.close(async () => {
            try {
                await prisma.$disconnect();
                logger.info("🔌 Conexões encerradas. Até logo!");
                process.exit(0);
            } catch (err) {
                logger.error("❌ Erro ao encerrar conexões", err);
                process.exit(1);
            }
        });

        // Failsafe: força encerramento em 10 segundos
        setTimeout(() => {
            logger.error("⏱️  Timeout no shutdown. Forçando encerramento.");
            process.exit(1);
        }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM")); // Render usa esse
    process.on("SIGINT", () => shutdown("SIGINT"));   // Ctrl+C local
}

start();