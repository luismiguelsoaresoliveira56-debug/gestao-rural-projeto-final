trabalho de gestao rural
pequenos produtores rurais costumam controlar tudo em caderno, papel solto, o de cabeça. Isso torna quase impossível responder perguntas simples, mas essenciais pro negócio quanto foi gasto pra produzir, o que rendeu mais, se aquele mês deu lucro ou prejuízo.



Você vai precisar de dois terminais abertos ao mesmo tempo — um pro back-end e outro pro front-end, já que são dois servidores rodando em paralelo.
(no meu pc o nodes so estava funcionado a versao 22 em outros pcs que testei estava funcionando no nodes normal)
1. Back-end(VERIFICA SE E A PASTA BACK)
bash
cd backend
npm install
node setup.js

O setup.js cria o banco raiz.db com as 5 tabelas do sistema. Só precisa rodar isso uma vez (ou de novo se você apagar o banco e quiser recomeçar do zero).

Depois, sobe o servidor:

bash
node index.js

Se aparecer Servidor rodando em http://localhost:3001 no terminal, deu certo. Você pode conferir abrindo essa URL no navegador — deve aparecer {"message": "API Raiz funcionando!"}.

2. Front-end

Em outro terminal, sem fechar o back-end:

bash
cd frontend
npm install
npm run dev

Acesse http://localhost:3000 e pronto, a aplicação está no ar.

Se você fechar o terminal do back-end, o front-end continua abrindo, mas nenhuma tela vai carregar dados — é assim mesmo, um depende do outro.

Como o projeto está organizado
raiz/
├── backend/
│   ├── db.js              → abre a conexão com o banco
│   ├── setup.js            → cria as tabelas (roda uma vez só)
│   ├── index.js              → o servidor em si, junta todas as rotas
│   └── routes/
│       ├── propriedades.js
│       ├── produtos.js
│       ├── producao.js
│       ├── despesas.js
│       ├── vendas.js
│       └── painel.js
└── frontend/
    ├── app/
    │   ├── layout.js        → aplica o Bootstrap e o menu em todas as páginas
    │   ├── propriedades/
    │   ├── produtos/
    │   ├── producao/
    │   ├── despesas/
    │   ├── vendas/
    │   └── painel/
    └── components/
        └── Navbar.js

Cada módulo do back-end segue o mesmo padrão: uma rota que lista, uma que busca por id, uma que cadastra, uma que atualiza e uma que exclui — o clássico CRUD. No front-end, cada página segue essa mesma lógica: busca os dados quando carrega, mostra numa tabela, e tem um formulário que serve tanto pra cadastrar quanto pra editar.

O banco de dados

Cinco tabelas, todas conectadas por chave estrangeira:

propriedades — dados gerais da propriedade (nome, localização, área)
produtos — pertence a uma propriedade
producao — registros de produção, cada um ligado a um produto
despesas — gastos, também ligados a uma propriedade
vendas — a tabela mais importante: aqui o total é sempre calculado pelo servidor, nunca confiando no que vem do formulário
As rotas da API

Todas seguem o padrão REST (GET, POST, PUT, DELETE) e devolvem JSON.

Módulo	Rota base	Observações
Propriedades	/api/propriedades	—
Produtos	/api/produtos	não deixa excluir produto com vendas
Produção	/api/producao	lista já traz o nome do produto junto
Despesas	/api/despesas	aceita ?categoria=X pra filtrar
Vendas	/api/vendas	total é sempre recalculado, mesmo se mandarem outro valor
Painel	/api/painel	aceita ?start_date= e ?end_date=

O painel devolve algo assim:

json
{
  "receita": 1250,
  "despesas": 780,
  "resultado": 470,
  "quantidade_producao": 320,
  "produto_mais_vendido": "Alface"
}
A regra de negócio que mais nos preocupamos em acertar

O total de uma venda nunca é recebido pronto do front-end. Mesmo que alguém tente mandar um valor forjado no corpo da requisição, o servidor ignora e recalcula:

js
const total = quantidade * valor_unitario;

Fizemos questão de testar isso na unha, mandando de propósito um total errado numa requisição de teste, só pra confirmar que o back-end realmente ignora e calcula por conta própria.

Outras validações que implementamos: campos obrigatórios não podem ficar vazios, quantidades e valores têm que ser maiores que zero, e não dá pra registrar uma venda ou uma produção referenciando um produto que não existe.

erros
Cadastrar propriedade sem nome	erro 400
Cadastrar propriedade com área 0	erro 400
Cadastrar produto com propriedade que não existe	erro 400
Registrar produção com quantidade 0	erro 400
Registrar despesa com valor negativo	erro 400
Forjar o total numa venda	servidor ignora e calcula certo
Excluir produto que já tem venda	bloqueado
Filtrar despesas por categoria	só mostra a categoria escolhida
Filtrar painel por período	números batem só com o intervalo

grupo :luis miguel soares oliveira
JOAO PEDRO R LIMA
LARA 

