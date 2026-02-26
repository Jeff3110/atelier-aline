-- Criação da tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    nome TEXT NOT NULL,
    telefone TEXT,
    instagram TEXT,
    email TEXT,
    observacoes TEXT
);

-- Criação da tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    servico TEXT NOT NULL,
    valor DECIMAL(10,2) DEFAULT 0.00,
    status TEXT DEFAULT 'pendente', -- pendente, confirmado, concluido, cancelado
    pago BOOLEAN DEFAULT false
);

-- Criação da tabela de Financeiro (Fluxo de Caixa)
CREATE TABLE IF NOT EXISTS financeiro (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    tipo TEXT NOT NULL, -- entrada, saida
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL
);

-- Habilitar RLS (Row Level Security) - Por ser um app simples de uso pessoal sem login inicial, 
-- vamos permitir acesso publico por enquanto, mas o ideal é adicionar auth depois.
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso Público" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Público" ON agendamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Público" ON financeiro FOR ALL USING (true) WITH CHECK (true);
