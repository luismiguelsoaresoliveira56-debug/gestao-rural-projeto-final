const Database = require("better-sqlite3");

const db = new Database("raiz.db");
db.pragma("foreign_keys = ON");

// 1. Propriedades
db.exec(`
  CREATE TABLE IF NOT EXISTS propriedades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    localizacao TEXT,
    area REAL NOT NULL
  );
`);

// 2. Produtos
db.exec(`
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    unidade TEXT NOT NULL,
    propriedade_id INTEGER NOT NULL,
    FOREIGN KEY (propriedade_id) REFERENCES propriedades(id)
  );
`);

// 3. Produção 
db.exec(`
  CREATE TABLE IF NOT EXISTS producao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    quantidade REAL NOT NULL,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
  );
`);

// 4. Despesas 
db.exec(`
  CREATE TABLE IF NOT EXISTS despesas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    valor REAL NOT NULL,
    data TEXT NOT NULL,
    propriedade_id INTEGER NOT NULL,
    FOREIGN KEY (propriedade_id) REFERENCES propriedades(id)
  );
`);

// 5. Vendas 
db.exec(`
  CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    quantidade REAL NOT NULL,
    valor_unitario REAL NOT NULL,
    total REAL NOT NULL,
    data TEXT NOT NULL,
    cliente TEXT,
    propriedade_id INTEGER NOT NULL,
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (propriedade_id) REFERENCES propriedades(id)
  );
`);

console.log("Banco de dados criado/atualizado com sucesso: raiz.db");
console.log("Tabelas: propriedades, produtos, producao, despesas, vendas");

db.close();
