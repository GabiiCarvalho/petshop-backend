// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Log detalhado de todas as requisições
app.use((req, res, next) => {
    console.log('🌐', new Date().toLocaleString(), req.method, req.originalUrl);
    console.log('📦 Body:', req.body);
    next();
});

// Importar e usar rotas
try {
    const routes = require('./routes');
    app.use('/api', routes);
    console.log('✅ Rotas carregadas com sucesso');
} catch (error) {
    console.error('❌ Erro ao carregar rotas:', error.message);
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor Rodando',
        timestamp: new Date().toISOString()
    });
});

// Rota padrão
app.get('/', (req, res) => {
    res.json({ 
        message: 'Bem-vindo ao Petshop API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: {
                login: 'POST /api/auth/login',
                cadastro: 'POST /api/auth/cadastrar-proprietario'
            }
        }
    });
});

// Middleware de erros
app.use((err, req, res, next) => {
    console.error('💥 Erro:', err);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: err.message 
    });
});

// Rota não encontrada (deve ser a última)
app.use('*', (req, res) => {
    console.log('🔍 Rota não encontrada:', req.method, req.originalUrl);
    res.status(404).json({ 
        error: 'Rota não encontrada',
        path: req.originalUrl,
        method: req.method,
        availableEndpoints: [
            'GET /api/health',
            'POST /api/auth/login',
            'POST /api/auth/cadastrar-proprietario'
        ]
    });
});

module.exports = app;