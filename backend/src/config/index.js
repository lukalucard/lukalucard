// ============================================================
// backend/config/index.js
// Configurações centralizadas da aplicação
// ============================================================

require("dotenv").config();

/**
 * Valida variáveis obrigatórias.
 * Se alguma estiver faltando, o servidor não inicia.
 */
function validateEnv() {
    const required = ["RESEND_API_KEY", "EMAIL_TO"];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error("❌ Variáveis de ambiente obrigatórias faltando:");
        missing.forEach((key) => console.error(`   - ${key}`));
        console.error("\nVerifique o arquivo .env na raiz do projeto.");
        process.exit(1);
    }
}

// Só valida se não estivermos em ambiente de teste
if (process.env.NODE_ENV !== "test") {
    validateEnv();
}

/**
 * Configurações exportadas
 */
const config = {
    // ================= SERVIDOR =================
    server: {
        port: parseInt(process.env.PORT, 10) || 3014,
        env: process.env.NODE_ENV || "development",
        isDevelopment: process.env.NODE_ENV === "development",
        isProduction: process.env.NODE_ENV === "production",
    },

    // ================= EMAIL =================
    email: {
        apiKey: process.env.RESEND_API_KEY,
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        fromName: process.env.EMAIL_FROM_NAME || "Portfólio",
        to: process.env.EMAIL_TO,
    },

    // ================= CORS =================
    cors: {
        allowedOrigins: (
            process.env.ALLOWED_ORIGINS ||
            "http://localhost:3014,http://localhost:3000"
        )
            .split(",")
            .map((origin) => origin.trim()),
    },

    // ================= RATE LIMIT =================
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 3600000,
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 5,
    },
};

module.exports = config;