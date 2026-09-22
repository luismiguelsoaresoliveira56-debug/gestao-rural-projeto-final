const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const { start_date, end_date } = req.query;

  // Monta a cláusula de filtro de data só se fala as duas datas(dando erro corigir)
  const temFiltro = start_date && end_date;
  const filtroData = temFiltro ? "WHERE data BETWEEN ? AND ?" : "";
  const params = temFiltro ? [start_date, end_date] : [];

  // Receita total (soma das vendas no período)
  const receita = db
    .prepare(`SELECT SUM(total) AS valor FROM vendas ${filtroData}`)
    .get(...params);

  // Despesas totais no período
  const despesasTotais = db
    .prepare(`SELECT SUM(valor) AS valor FROM despesas ${filtroData}`)
    .get(...params);

  // Quantidade produzida no período
  const producaoTotal = db
    .prepare(`SELECT SUM(quantidade) AS valor FROM producao ${filtroData}`)
    .get(...params);

  // Produto mais vendido no período
  const produtoMaisVendido = db
    .prepare(
      `SELECT produtos.nome, SUM(vendas.quantidade) AS total_vendido
       FROM vendas
       JOIN produtos ON produtos.id = vendas.produto_id
       ${temFiltro ? "WHERE vendas.data BETWEEN ? AND ?" : ""}
       GROUP BY produtos.nome
       ORDER BY total_vendido DESC
       LIMIT 1`
    )
    .get(...params);

  const receitaValor = receita.valor || 0;
  const despesasValor = despesasTotais.valor || 0;

  res.json({
    receita: receitaValor,
    despesas: despesasValor,
    resultado: receitaValor - despesasValor,
    quantidade_producao: producaoTotal.valor || 0,
    produto_mais_vendido: produtoMaisVendido ? produtoMaisVendido.nome : null,
  });
});

// despesas-por-categoria
router.get("/despesas-por-categoria", (req, res) => {
  const resumo = db
    .prepare(
      `SELECT categoria, SUM(valor) AS total
       FROM despesas
       GROUP BY categoria
       ORDER BY total DESC`
    )
    .all();

  res.json(resumo);
});

module.exports = router;
