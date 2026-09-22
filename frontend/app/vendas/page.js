"use client";

import { useState, useEffect } from "react";

const API_VENDAS = "http://localhost:3001/api/vendas";
const API_PRODUTOS = "http://localhost:3001/api/produtos";
const API_PROPRIEDADES = "http://localhost:3001/api/propriedades";

export default function VendasPage() {
  const [vendas, setVendas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [propriedades, setPropriedades] = useState([]);
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    produto_id: "",
    quantidade: "",
    valor_unitario: "",
    data: "",
    cliente: "",
    propriedade_id: "",
  });

  async function carregarVendas() {
    try {
      const res = await fetch(API_VENDAS);
      const dados = await res.json();
      setVendas(dados);
    } catch (err) {
      setErro("Não foi possível conectar à API. O back-end está rodando?");
    }
  }

  async function carregarProdutos() {
    try {
      const res = await fetch(API_PRODUTOS);
      const dados = await res.json();
      setProdutos(dados);
    } catch (err) {
      setErro("Não foi possível carregar os produtos.");
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
    carregarVendas();
    carregarProdutos();
    carregarPropriedades();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Total só para exibição enquanto o usuário digita.
  // O valor que realmente é salvo vem calculado pelo back-end.
  const totalEstimado =
    (Number(form.quantidade) || 0) * (Number(form.valor_unitario) || 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    // Repare: "total" NÃO é enviado. O back-end calcula sozinho.
    const payload = {
      produto_id: Number(form.produto_id),
      quantidade: Number(form.quantidade),
      valor_unitario: Number(form.valor_unitario),
      data: form.data,
      cliente: form.cliente,
      propriedade_id: Number(form.propriedade_id),
    };

    try {
      const url = editandoId ? `${API_VENDAS}/${editandoId}` : API_VENDAS;
      const method = editandoId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const dados = await res.json();

      if (!res.ok) {
        setErro(dados.error || "Erro ao salvar venda");
        return;
      }

      setForm({
        produto_id: "",
        quantidade: "",
        valor_unitario: "",
        data: "",
        cliente: "",
        propriedade_id: "",
      });
      setEditandoId(null);
      carregarVendas();
    } catch (err) {
      setErro("Não foi possível conectar à API.");
    }
  }

  function iniciarEdicao(venda) {
    setEditandoId(venda.id);
    setForm({
      produto_id: venda.produto_id,
      quantidade: venda.quantidade,
      valor_unitario: venda.valor_unitario,
      data: venda.data,
      cliente: venda.cliente || "",
      propriedade_id: venda.propriedade_id,
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm({
      produto_id: "",
      quantidade: "",
      valor_unitario: "",
      data: "",
      cliente: "",
      propriedade_id: "",
    });
  }

  async function handleExcluir(id) {
    if (!confirm("Tem certeza que deseja excluir esta venda?")) return;

    try {
      const res = await fetch(`${API_VENDAS}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const dados = await res.json();
        setErro(dados.error || "Erro ao excluir venda");
        return;
      }

      carregarVendas();
    } catch (err) {
      setErro("Não foi possível conectar à API.");
    }
  }

  return (
    <div>
      <h1 className="mb-4">Vendas</h1>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {produtos.length === 0 && (
        <div className="alert alert-warning">
          Cadastre pelo menos um produto antes de registrar vendas.
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">
            {editandoId ? "Editar venda" : "Nova venda"}
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Produto</label>
                <select
                  name="produto_id"
                  className="form-select"
                  value={form.produto_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione...</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">Quantidade</label>
                <input
                  type="number"
                  step="0.01"
                  name="quantidade"
                  className="form-control"
                  value={form.quantidade}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Valor unit. (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="valor_unitario"
                  className="form-control"
                  value={form.valor_unitario}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-2">
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

              <div className="col-md-2">
                <label className="form-label">Cliente</label>
                <input
                  type="text"
                  name="cliente"
                  className="form-control"
                  placeholder="ex: Feira"
                  value={form.cliente}
                  onChange={handleChange}
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

              <div className="col-md-6 d-flex align-items-end">
                <div className="alert alert-info mb-0 py-2 w-100">
                  Total estimado: <strong>R$ {totalEstimado.toFixed(2)}</strong>
                  <br />
                  <small className="text-muted">
                    (o valor final salvo é sempre recalculado pelo servidor)
                  </small>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <button type="submit" className="btn btn-success me-2">
                {editandoId ? "Salvar alterações" : "Registrar venda"}
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

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Qtd.</th>
            <th>Valor unit.</th>
            <th>Total</th>
            <th>Data</th>
            <th>Cliente</th>
            <th style={{ width: "160px" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {vendas.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-muted">
                Nenhuma venda registrada ainda.
              </td>
            </tr>
          )}

          {vendas.map((venda) => (
            <tr key={venda.id}>
              <td>{venda.produto_nome}</td>
              <td>{venda.quantidade}</td>
              <td>R$ {Number(venda.valor_unitario).toFixed(2)}</td>
              <td>
                <strong>R$ {Number(venda.total).toFixed(2)}</strong>
              </td>
              <td>{venda.data}</td>
              <td>{venda.cliente || "-"}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => iniciarEdicao(venda)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleExcluir(venda.id)}
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
