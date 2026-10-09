// ============================================================
// backend/src/config/prismaClient.js
// Instância única do Prisma Client (Singleton)
// ============================================================

const { PrismaClient } = require("../generated/prisma");
const logger = require("../utils/logger");

/**
 * Instância global do Prisma Client.
 *
 * Em desenvolvimento, o Node reinicia com frequência (--watch).
 * Cada reinício criaria uma nova instância → muitas conexões abertas
 * → o banco esgota o pool.
 *
 * Solução: guardar a instância em `globalThis` para reaproveitar
 * entre reloads.
 */
const globalForPrisma = globalThis;

const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: [
            { emit: "event", level: "error" },
            { emit: "event", level: "warn" },
        ],
    });

// Logs do Prisma integrados ao nosso logger
prisma.$on("error", (e) => {
    logger.error(`[Prisma] ${e.message}`);
});

prisma.$on("warn", (e) => {
    logger.warn(`[Prisma] ${e.message}`);
});

// Em desenvolvimento, guarda a instância no global
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

module.exports = prisma;