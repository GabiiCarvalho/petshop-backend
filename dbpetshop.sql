-- Tabela de Lojas
CREATE TABLE lojas (
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	endereco TEXT,
	telefone VARCHAR(20),
	email VARCHAR(100),
	ativa BOOLEAN DEFAULT TRUE,
	data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários (administradores e funcionários)
CREATE TABLE usuarios (
	id SERIAL PRIMARY KEY,
	loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	senha_hash VARCHAR(255) NOT NULL,
	telefone VARCHAR(20),
	cargo VARCHAR(50) NOT NULL CHECK (cargo IN ('proprietario', 'gerente', 'funcionario')),
	ativo BOOLEAN DEFAULT TRUE,
	data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Clientes
CREATE TABLE clientes (
	id SERIAL PRIMARY KEY,
	loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
	nome VARCHAR(100) NOT NULL,
	telefone VARCHAR(20) NOT NULL,
	email VARCHAR(100),
	endereco TEXT,
	observacoes TEXT,
	data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pets
CREATE TABLE pets (
	id SERIAL PRIMARY KEY,
	cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
	loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
	nome VARCHAR(100) NOT NULL,
	especie VARCHAR(50) CHECK (especie IN ('cachorro', 'gato', 'outro')),
	raca VARCHAR(100),
	data_nascimento DATE,
	peso DECIMAL(5,2),
	alergias TEXT,
	observacoes TEXT,
	foto_url TEXT,
	data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Planos Mensais
CREATE TABLE planos_mensais (
	id SERIAL PRIMARY KEY,
	pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
	loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
	data_inicio DATE NOT NULL,
	data_fim DATE NOT NULL,
	banhos_inclusos INTEGER NOT NULL DEFAULT 4,
	banhos_utilizados INTEGER NOT NULL DEFAULT 0,
	tosas_inclusas INTEGER NOT NULL DEFAULT 1,
	tosas_utilizadas INTEGER NOT NULL DEFAULT 0,
	valor_total DECIMAL(10,2) NOT NULL,
	status VARCHAR(20) CHECK (status IN ('ativo', 'inativo', 'suspenso')) DEFAULT 'ativo',
	data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Serviços
CREATE TABLE servicos (
	id SERIAL PRIMARY KEY,
	loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
	nome VARCHAR(100) NOT NULL,
	descricao TEXT,
	preco DECIMAL(10,2) NOT NULL,
	duracao_minutos INTEGER NOT NULL,
	ativo BOOLEAN DEFAULT TRUE,
	data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Agendamentos
CREATE TABLE agendamentos (
	id SERIAL PRIMARY KEY,
	loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
	pet_id INTEGER REFERENCES pets(id) ON DELETE SET NULL,
	cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
	usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
	data_hora TIMESTAMP NOT NULL,
	data_hora_fim TIMESTAMP NOT NULL,
	status VARCHAR(20) CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'nao_compareceu')) DEFAULT 'agendamento',
	observacoes TEXT,
	data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens de Agendamento (serviços agendados)
CREATE TABLE agendamento_itens (
	id SERIAL PRIMARY KEY,
	agendamento_id INTEGER REFERENCES agendamentos(id) ON DELETE CASCADE,
	servico_id INTEGER REFERENCES servicos(id) ON DELETE SET NULL,
	plano_mensal_id INTEGER REFERENCES planos_mensais(id) ON DELETE SET NULL,
	nome_servico VARCHAR(100) NOT NULL,
	descricao_servico TEXT,
	preco DECIMAL(10,2) NOT NULL,
	usando_plano BOOLEAN DEFAULT FALSE,
	concluido BOOLEAN DEFAULT FALSE,
	observacoes TEXT,
	data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Produtos
CREATE TABLE produtos (
	id SERIAL PRIMARY KEY,
	loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
	nome VARCHAR(100) NOT NULL,
	descricao TEXT,
	preco DECIMAL(10,2) NOT NULL,
	estoque INTEGER NOT NULL DEFAULT 0,
	codigo_barras VARCHAR(50),
	ativo BOOLEAN DEFAULT TRUE,
	data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Vendas
CREATE TABLE vendas (
	id SERIAL PRIMARY KEY,
	loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
	cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
	usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
	data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	subtotal DECIMAL(10,2) NOT NULL,
	desconto DECIMAL(10,2) DEFAULT 0,
	total DECIMAL(10,2) NOT NULL,
	forma_pagamento VARCHAR(50) CHECK (forma_pagamento IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix')) DEFAULT 'pago',
	observacoes TEXT,
	data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens de Venda
CREATE TABLE venda_itens (
	id SERIAL PRIMARY KEY,
	venda_id INTEGER REFERENCES vendas(id) ON DELETE CASCADE,
	produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
	servico_id INTEGER REFERENCES servicos(id) ON DELETE SET NULL,
	agendamento_id INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
	item_nome VARCHAR(100) NOT NULL,
	item_descricao TEXT,
	quantidade INTEGER NOT NULL DEFAULT 1,
	preco_unitario DECIMAL(10,2) NOT NULL,
	desconto DECIMAL(10,2) DEFAULT 0,
	total DECIMAL(10,2) NOT NULL,
	data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Registro de Atividades (para auditoria)
CREATE TABLE registros_atividades (
	id SERIAL PRIMARY KEY,
	loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
	usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
	acao VARCHAR(100) NOT NULL,
	tabela_afetada VARCHAR(50),
	registro_id INTEGER,
	detalhes TEXT,
	ip_address VARCHAR(50),
	data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Configurações do Sistema
CREATE TABLE configuracoes (
	id SERIAL PRIMARY KEY,
	loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
	chave VARCHAR(100) NOT NULL,
	valor TEXT,
	descricao TEXT,
	data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(loja_id, chave)
);

-- Índices para tabela 'agendamentos'
CREATE INDEX idx_agendamentos_loja_data ON agendamentos(loja_id, data_hora);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_cliente ON agendamentos(cliente_id);

-- Índices para tabela 'clientes'
CREATE INDEX idx_clientes_telefone ON clientes(telefone);
CREATE INDEX idx_clientes_loja ON clientes(loja_id);

-- Índices para tabela 'vendas'
CREATE INDEX idx_vendas_loja_data ON vendas(loja_id, data_hora);
CREATE INDEX idx_vendas_cliente ON vendas(cliente_id);