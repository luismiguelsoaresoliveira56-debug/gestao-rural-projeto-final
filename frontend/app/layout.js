import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "RAIZ - Gestão para Pequenos Produtores Rurais",
  description: "Ferramenta de gestão para pequenas propriedades rurais",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        <main className="container my-4">{children}</main>
      </body>
    </html>
  );
}
