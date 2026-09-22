"use client";

import { useState, useEffect } from "react";

const API_DESPESAS = "http://localhost:3001/api/despesas";
const API_PROPRIEDADES = "http://localhost:3001/api/propriedades";

const CATEGORIAS = ["Alimentação", "Insumos", "Energia", "Transporte", "Manutenção", "Outros"];

export default function DespesasPage() {
  const [despesas, setDespesas] = useState([]);
  const [propriedades, setPropriedades] = useState([]);
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const [form, setForm] = useState({
    descricao: "",
    categoria: "",
    valor: "",
    data: "",
    propriedade_id: "",
  });

  async function carregarDespesas(categoria = "") {
    try {
      const url = categoria ? `${API_DESPESAS}?categoria=${categoria}` : API_DESPESAS;
      const res = await fetch(url);
      const dados = await res.json();
      setDespesas(dados);
    } catch (err) {
      setErro("Não foi possível conectar à API. O back-end está rodando?");
    }
  }

  async function carregarPropriedades() {
    try {
      const res = await fetch(API_PROPRIEDADES);
      const dados = await res.json();
      setPropriedades(dados);
    } catch (err) {
      setErro("Não foi possível carregar as propriedades.");
    }
  }

  useEffect(() => {
    carregarDespesas();
    carregarPropriedades();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFiltroChange(e) {
    const categoria = e.target.value;
    setFiltroCategoria(categoria);
    carregarDespesas(categoria);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    const payload = {
      descricao: form.descricao,
      categoria: form.categoria,
      valor: Number(form.valor),
      data: form.data,
      propriedade_id: Number(form.propriedade_id),
    };

    try {
      const url = editandoId ? `${API_DESPESAS}/${editandoId}` : API_DESPESAS;
      const method = editandoId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const dados = await res.json();

      if (!res.ok) {
        setErro(dados.error || "Erro ao salvar despesa");
        return;
      }

      setForm({ descricao: "", categoria: "", valor: "", data: "", propriedade_id: "" });
      setEditandoId(null);
      carregarDespesas(filtroCategoria);
    } catch (err) {
      setErro("Não foi possível conectar à API.");
    }
  }

  function iniciarEdicao(despesa) {
    setEditandoId(despesa.id);
    setForm({
      descricao: despesa.descricao,
      categoria: despesa.categoria,
      valor: despesa.valor,
      data: despesa.data,
      propriedade_id: despesa.propriedade_id,
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm({ descricao: "", categoria: "", valor: "", data: "", propriedade_id: "" });
  }

  async function handleExcluir(id) {
    if (!confirm("Tem certeza que deseja excluir esta despesa?")) return;

    try {
      const res = await fetch(`${API_DESPESAS}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const dados = await res.json();
        setErro(dados.error || "Erro ao excluir despesa");
        return;
      }

      carregarDespesas(filtroCategoria);
    } catch (err) {
      setErro("Não foi possível conectar à API.");
    }
  }

  return (
    <div>
      <h1 className="mb-4">Despesas</h1>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {propriedades.length === 0 && (
        <div className="alert alert-warning">
          Cadastre pelo menos uma propriedade antes de registrar despesas.
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">
            {editandoId ? "Editar despesa" : "Nova despesa"}
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Descrição</label>
                <input
                  type="text"
                  name="descricao"
                  className="form-control"
                  value={form.descricao}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Categoria</label>
                <select
                  name="categoria"
                  className="form-select"
                  value={form.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione...</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="valor"
                  className="form-control"
                  value={form.valor}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Data</label>
                <input
                  type="date"
                  name="data"
                  className="form-control"
                  value={form.data}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Propriedade</label>
                <select
                  name="propriedade_id"
                  className="form-select"
                  value={form.propriedade_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione...</option>
                  {propriedades.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <button type="submit" className="btn btn-success me-2">
                {editandoId ? "Salvar alterações" : "Registrar"}
              </button>

              {editandoId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelarEdicao}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Filtro por categoria */}
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Filtrar por categoria</label>
          <select
            className="form-select"
            value={filtroCategoria}
            onChange={handleFiltroChange}
          >
            <option value="">Todas as categorias</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Valor (R$)</th>
            <th>Data</th>
            <th style={{ width: "160px" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {despesas.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                Nenhuma despesa encontrada.
              </td>
            </tr>
          )}

          {despesas.map((despesa) => (
            <tr key={despesa.id}>
              <td>{despesa.descricao}</td>
              <td>
                <span className="badge bg-secondary">{despesa.categoria}</span>
              </td>
              <td>{Number(despesa.valor).toFixed(2)}</td>
              <td>{despesa.data}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => iniciarEdicao(despesa)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleExcluir(despesa.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
