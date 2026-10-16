-- Script de referência (opcional: o Hibernate já cria as tabelas sozinho).
CREATE DATABASE IF NOT EXISTS farmacia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmacia;

CREATE TABLE IF NOT EXISTS medicamentos (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(150)  NOT NULL,
    fabricante  VARCHAR(100),
    preco       DECIMAL(10,2) NOT NULL,
    estoque     INT           NOT NULL DEFAULT 0,
    validade    DATE
);

CREATE TABLE IF NOT EXISTS vendas (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    data_hora  DATETIME      NOT NULL,
    total      DECIMAL(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS itens_venda (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    venda_id       BIGINT        NOT NULL,
    medicamento_id BIGINT        NOT NULL,
    quantidade     INT           NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venda_id)       REFERENCES vendas(id),
    FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id)
);

-- Dados de exemplo
INSERT INTO medicamentos (nome, fabricante, preco, estoque, validade) VALUES
('Dipirona 500mg', 'EMS', 8.90, 120, '2027-08-01'),
('Paracetamol 750mg', 'Medley', 12.50, 80, '2027-03-15'),
('Ibuprofeno 600mg', 'Neo Química', 18.75, 8, '2026-12-20'),
('Amoxicilina 500mg', 'Eurofarma', 32.40, 45, '2027-01-10'),
('Losartana 50mg', 'Biosintética', 15.30, 60, '2027-06-30');
