const express = require('express');
const router = express.Router();

// Rota de login
router.post('/login', (req, res) => {
    try {
        const { email, senha } = req.body;
        
        console.log('📧 Tentativa de login:', email);
        
        if (!email || !senha) {
            return res.status(400).json({ 
                error: 'Email e senha são obrigatórios' 
            });
        }

        res.json({
            message: 'Rota de login funcionando',
            received: req.body
        });
    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({ 
            error: 'Erro interno no servidor'
        });
    }
});

// Rota de cadastro de proprietário - CORRIGIDA! (adição da barra /)
router.post('/cadastrar-proprietario', (req, res) => { // ← FALTAVA A BARRA /
    try {
        console.log('📝 Dados recebidos para cadastro:', JSON.stringify(req.body, null, 2));

        // Dados do frontend
        const { 
            name,           
            email,          
            password,       
            confirmPassword,
            phone,          
            cnpj,           
            address,        
            petshopName     
        } = req.body;

        // Validações básicas
        if (!name || !email || !password || !confirmPassword || !phone || !address || !petshopName) {
            return res.status(400).json({ 
                error: 'Todos os campos obrigatórios devem ser preenchidos' 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                error: 'As senhas não coincidem' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'A senha deve ter pelo menos 6 caracteres' 
            });
        }

        
        res.status(201).json({
            message: 'Rota de cadastro funcionando - Dados recebidos com sucesso',
            dadosRecebidos: {
                proprietario: {
                    nome: name,
                    email: email,
                    telefone: phone
                },
                petshop: {
                    nome: petshopName,
                    endereco: address,
                    cnpj: cnpj
                }
            },
            observacao: 'Estes dados seriam salvos no banco de dados pelo controller'
        });

    } catch (error) {
        console.error('❌ Erro no cadastro:', error);
        res.status(500).json({ 
            error: 'Erro interno no servidor'
        });
    }
});

module.exports = router;