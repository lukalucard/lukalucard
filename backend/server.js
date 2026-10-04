// backend/server.js
const express = require('express');
const path = require('path');
const app = express();

// ============================================================
// Rotas da API (para quando o backend estiver pronto)
// ============================================================
// app.use('/api', require('./routes/api'));

// ============================================================
// Arquivos estáticos (HTML, CSS, JS, imagens)
// IMPORTANTE: como o server está em backend/, precisamos subir uma pasta
// ============================================================
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Fallback: qualquer rota não encontrada devolve o index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============================================================
// Start do servidor
// ============================================================
const PORT = process.env.PORT || 3014;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});