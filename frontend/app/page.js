export default function Home() {
  return (
    <div className="container py-5">

      <div className="text-center mb-5">
        <h1 className="fw-bold">
          Bem-vindo ao site de gestão rural
        </h1>

        <p className="lead text-muted">
          Ferramenta de gestão para pequenos produtores rurais
        </p>
      </div>

      <div className="row g-4">

        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h4> Propriedades</h4>
              <p className="text-muted">
                Cadastre e acompanhe suas propriedades rurais.
              </p>

              <a
                href="/propriedades"
                className="btn btn-success"
              >
                Acessar
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h4> Produtos</h4>
              <p className="text-muted">
                Controle os produtos e o estoque da propriedade.
              </p>

              <a
                href="/produtos"
                className="btn btn-success"
              >
                Acessar
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h4> Produção</h4>
              <p className="text-muted">
                Registre e acompanhe a produção rural.
              </p>

              <a
                href="/producao"
                className="btn btn-success"
              >
                Acessar
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h4> Vendas</h4>
              <p className="text-muted">
                Registre suas vendas e acompanhe os resultados.
              </p>

              <a
                href="/vendas"
                className="btn btn-success"
              >
                Acessar
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h4> Despesas</h4>
              <p className="text-muted">
                Controle os gastos da propriedade.
              </p>

              <a
                href="/despesas"
                className="btn btn-success"
              >
                Acessar
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h4>Painel</h4>
              <p className="text-muted">
                Visualize os principais dados da sua gestão.
              </p>

              <a
                href="/painel"
                className="btn btn-success"
              >
                Acessar
              </a>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}