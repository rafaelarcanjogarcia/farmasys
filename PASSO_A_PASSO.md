# PASSO A PASSO – do zero ao portfólio

## 1. Ferramentas para instalar
| Para quê | Ferramenta | Link |
|---|---|---|
| Java | **JDK 17** (Temurin/Adoptium) | https://adoptium.net |
| IDE (recomendada) | **IntelliJ IDEA Community** (já traz Maven) | https://www.jetbrains.com/idea/download |
| IDE alternativa | VS Code + "Extension Pack for Java" | https://code.visualstudio.com |
| Banco de dados | **MySQL 8 Community + MySQL Workbench** | https://dev.mysql.com/downloads |
| Testar a API | **Postman** ou Insomnia | https://www.postman.com |
| Versionamento | **Git** + conta no **GitHub** | https://git-scm.com / https://github.com |

Confirme no terminal: `java -version` (deve mostrar 17+) e `git --version`.

## 2. Preparar o MySQL
1. Instale o MySQL e guarde a senha do usuário `root`.
2. Abra o Workbench e conecte em `localhost:3306`.
3. (Opcional) Execute `database/schema.sql` para criar o banco e inserir 5 medicamentos de exemplo.
   Se pular, o sistema cria tudo sozinho.

## 3. Abrir o projeto
1. Extraia o .zip.
2. IntelliJ → **File > Open** → selecione a pasta `farmacia` (onde está o `pom.xml`).
3. Aguarde o Maven baixar as dependências (barra de progresso no canto inferior).

## 4. Configurar a conexão
Abra `src/main/resources/application.properties` e troque `SUA_SENHA_AQUI` pela senha do seu MySQL.

## 5. Executar
- IntelliJ: abra `FarmaciaApplication.java` e clique no ▶ ao lado do `main`.
- Terminal: `mvn spring-boot:run`

Quando aparecer `Started FarmaciaApplication`, acesse **http://localhost:8080**.

## 6. Testar
1. Aba **Medicamentos**: cadastre, edite, exclua e busque.
2. Aba **Nova venda**: adicione itens, finalize e volte à aba Medicamentos para ver o estoque reduzido.
3. Tente vender mais que o estoque → o sistema recusa.
4. Aba **Faturamento**: consulte o período e veja total, nº de vendas e ticket médio.
5. No Postman, teste `GET http://localhost:8080/api/medicamentos`.

## 7. Problemas comuns
| Erro | Solução |
|---|---|
| `Access denied for user 'root'` | Senha errada no `application.properties` |
| `Communications link failure` | MySQL não está rodando (inicie o serviço) |
| `Port 8080 was already in use` | Troque `server.port` no `application.properties` |
| `release version 17 not supported` | IntelliJ: File > Project Structure > SDK = 17 |

## 8. Publicar no GitHub (portfólio)
```bash
git init
git add .
git commit -m "Sistema de vendas para farmácia"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/farmasys.git
git push -u origin main
```
**Dicas para impressionar recrutadores:**
- Tire 3–4 prints (medicamentos, venda, faturamento) e coloque no README.
- Grave um GIF curto de 30s do sistema funcionando.
- Escreva no README as decisões técnicas (transação na venda, preço salvo no item).
- Para ter um link público: Railway/Render (back-end) + banco MySQL gerenciado.

## 9. Próximas evoluções (para crescer o projeto)
1. **Testes automatizados** com JUnit/Mockito no `VendaService`.
2. **Login e perfis** (caixa × gerente) com Spring Security.
3. **Cadastro de clientes** e vendas vinculadas a eles.
4. **Relatórios**: medicamentos mais vendidos, vencendo em 30 dias, gráfico de faturamento.
5. **Docker Compose** para subir app + MySQL com um comando.
6. **Documentação da API** com Swagger (springdoc-openapi).
