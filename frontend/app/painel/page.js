"use client";

import { useState, useEffect } from "react";

const API_PAINEL = "http://localhost:3001/api/painel";
const API_DESPESAS_CATEGORIA = "http://localhost:3001/api/painel/despesas-por-categoria";

export default function PainelPage() {
  const [resumo, setResumo] = useState(null);
  const [despesasPorCategoria, setDespesasPorCategoria] = useState([]);
  const [erro, setErro] = useState("");

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  async function carregarPainel(inicio = "", fim = "") {
    try {
      const url =
        inicio && fim
          ? `${API_PAINEL}?start_date=${inicio}&end_date=${fim}`
          : API_PAINEL;

      const res = await fetch(url);
      const dados = await res.json();
      setResumo(dados);
    } catch (err) {
      setErro("Não foi possível conectar à API. O back-end está rodando?");
    }
  }

  async function carregarDespesasPorCategoria() {
    try {
      const res = await fetch(API_DESPESAS_CATEGORIA);
      const dados = await res.json();
      setDespesasPorCategoria(dados);
    } catch (err) {
      setErro("Não foi possível carregar o resumo de despesas.");
    }
  }

  useEffect(() => {
    carregarPainel();
    carregarDespesasPorCategoria();
  }, []);

  function aplicarFiltro(e) {
    e.preventDefault();
    carregarPainel(dataInicio, dataFim);
  }

  function limparFiltro() {
    setDataInicio("");
    setDataFim("");
    carregarPainel();
  }

  const totalDespesasCategoria = despesasPorCategoria.reduce(
    (soma, c) => soma + c.total,
    0
  );

  if (!resumo) {
    return <p>Carregando painel...</p>;
  }

  return (
    <div>
      <h1 className="mb-4">Painel</h1>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {/* Filtro por período */}
      <form className="row g-3 align-items-end mb-4" onSubmit={aplicarFiltro}>
        <div className="col-md-3">
          <label className="form-label">Data inicial</label>
          <input
            type="date"
            className="form-control"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Data final</label>
          <input
            type="date"
            className="form-control"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
        <div className="col-md-auto">
          <button type="submit" className="btn btn-success me-2">
            Filtrar
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={limparFiltro}>
            Limpar
          </button>
        </div>
      </form>

      {/* Cards de indicadores */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Receita total</p>
              <h3 className="text-success">R$ {resumo.receita.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Despesas totais</p>
              <h3 className="text-danger">R$ {resumo.despesas.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Resultado</p>
              <h3 className={resumo.resultado >= 0 ? "text-success" : "text-danger"}>
                R$ {resumo.resultado.toFixed(2)}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Produto mais vendido</p>
              <h3>{resumo.produto_mais_vendido || "—"}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Itens produzidos</p>
              <h3>{resumo.quantidade_producao}</h3>
            </div>
          </div>
        </div>

        {/* Despesas por categoria, com barras proporcionais */}
        <div className="col-md-8">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Despesas por categoria</h5>

              {despesasPorCategoria.length === 0 && (
                <p className="text-muted">Nenhuma despesa registrada ainda.</p>
              )}

              {despesasPorCategoria.map((c) => {
                const percentual =
                  totalDespesasCategoria > 0
                    ? (c.total / totalDespesasCategoria) * 100
                    : 0;

                return (
                  <div key={c.categoria} className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>{c.categoria}</span>
                      <span>R$ {c.total.toFixed(2)}</span>
                    </div>
                    <div className="progress" style={{ height: "8px" }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${percentual}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
