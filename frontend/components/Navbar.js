
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container">
        <Link className="navbar-brand fw-bold" href="/">
           gestão rural
           
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" href="/propriedades">
                Propriedades
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/produtos">
                Produtos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/producao">
                Produção
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/despesas">
                Despesas
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/vendas">
                Vendas
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/painel">
                Painel
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
