# 💊 FarmaSys – Sistema de Vendas para Farmácia

Sistema web para **cadastrar medicamentos, controlar estoque, registrar vendas e calcular o faturamento**.

## Tecnologias
- **Back-end:** Java 17, Spring Boot 3 (Web, Data JPA, Validation), Maven
- **Banco de dados:** MySQL 8
- **Front-end:** HTML, CSS e JavaScript puro (consumindo a API REST com `fetch`)

## Funcionalidades
- CRUD de medicamentos (nome, fabricante, preço, estoque, validade) com busca
- Alerta visual de estoque baixo (< 10) e de produto vencido
- Venda com carrinho: baixa automática no estoque, em transação
- Bloqueio de venda com estoque insuficiente ou medicamento vencido
- Preço unitário gravado no item (histórico não muda se o preço mudar depois)
- Faturamento por período: total, nº de vendas e ticket médio

## Como rodar
1. Instale JDK 17+, MySQL 8 e Maven (ou use o Maven embutido do IntelliJ).
2. Edite `src/main/resources/application.properties` com seu usuário/senha do MySQL.
3. Na raiz do projeto: `mvn spring-boot:run`
4. Abra http://localhost:8080

> O banco `farmacia` e as tabelas são criados automaticamente. O arquivo `database/schema.sql`
> mostra o modelo e tem dados de exemplo (opcional).

## Endpoints da API
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/medicamentos?busca=` | Lista/busca medicamentos |
| POST | `/api/medicamentos` | Cadastra |
| PUT | `/api/medicamentos/{id}` | Atualiza |
| DELETE | `/api/medicamentos/{id}` | Exclui |
| POST | `/api/vendas` | Registra venda `{"itens":[{"medicamentoId":1,"quantidade":2}]}` |
| GET | `/api/vendas?inicio=&fim=` | Lista vendas (período opcional) |
| GET | `/api/faturamento?inicio=&fim=` | Total, quantidade e ticket médio |

## Estrutura
```
src/main/java/com/farmacia
 ├─ model/        entidades JPA (Medicamento, Venda, ItemVenda)
 ├─ repository/   acesso ao banco
 ├─ service/      regras de negócio (VendaService)
 ├─ controller/   endpoints REST
 ├─ dto/          objetos de entrada/saída
 └─ exception/    tratamento global de erros
src/main/resources/static   front-end (index.html, style.css, app.js)
```
