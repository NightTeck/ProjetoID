# PetID — Projeto de Desenvolvimento em Back-End

Sistema web completo (Front-End + Back-End em PHP + MySQL) desenvolvido para a
disciplina **Projeto de Desenvolvimento em Back-End** (ADS — UNISUAM).

## Como rodar o projeto localmente

Pré-requisitos: PHP 8+, MySQL 8+ (pode usar XAMPP, Laragon, MAMP, etc.).

1. **Banco de dados**
   - Crie o banco executando o script `sql/schema.sql` (via phpMyAdmin, MySQL
     Workbench ou linha de comando: `mysql -u root -p < sql/schema.sql`).
   - Isso cria o banco `petid_db`, as tabelas `usuarios` e
     `logs_autenticacao`, e já insere o usuário **master**.

2. **Configuração de conexão**
   - Edite `php/config.php` com o host/usuário/senha do seu MySQL, se
     necessário (por padrão usa `localhost` / `root` / senha em branco).

3. **Servidor PHP**
   - Na raiz do projeto, rode: `php -S localhost:8000`
   - Acesse `http://localhost:8000/login.php`

## Login de teste (usuário master)

- **Login:** `master`
- **Senha:** `master12`
- Perguntas do 2FA usam os dados já cadastrados no script SQL:
  - Nome da mãe: `Maria Aparecida Souza`
  - Data de nascimento: `01/01/1990`
  - CEP: `22000000`

Para o perfil **comum**, cadastre-se pela tela `cadastro.php` — o 2FA usará o
Nome da mãe, a Data de nascimento e o CEP informados no seu próprio cadastro.

## Estrutura de pastas

```
petid-backend/
├── index.php              Tela Principal (hero, como funciona, identidade do pet)
├── login.php               Tela de Login
├── cadastro.php             Tela de Cadastro de Usuário
├── 2fa.php                  Segundo Fator de Autenticação
├── logout.php
├── erro.php                 Tela de mensagens de Erro
├── consulta_usuario.php     Consulta de Usuário (master)
├── log.php                  Tela de Log (master)
├── alterar_senha.php        Alteração de Senha (comum)
├── modelo_bd.php            Modelo do BD (imagem do DER)
├── css/styles.css
├── js/
│   ├── app.js               acessibilidade, menu mobile, toasts, modais
│   ├── validacoes.js        máscaras e validações de formulário
│   ├── consulta.js          AJAX da Consulta de Usuário
│   └── log.js                AJAX da Tela de Log
├── php/
│   ├── config.php           conexão PDO com o MySQL
│   ├── auth.php              sessão / controle de acesso por perfil
│   ├── functions.php         validações server-side (CPF, telefone, 2FA...)
│   ├── header.php / footer.php
│   ├── consulta_ajax.php     endpoint AJAX (buscar/excluir usuário)
│   ├── log_ajax.php          endpoint AJAX (filtrar log)
│   ├── SimplePDF.php         gerador de PDF (sem libs externas)
│   └── download_pdf.php      exporta a lista de usuários em PDF
├── sql/schema.sql            criação do banco + usuário master
└── assets/images/der-diagram.png   modelo do banco de dados (DER)
```

## Requisitos atendidos

- 9 telas do sistema: Principal, Cadastro, Login, Erro, 2FA, Consulta de
  Usuário, Alteração de Senha, Log, Modelo do BD.
- 2 perfis (`master` e `comum`) com controle de acesso via sessão
  (`php/auth.php`).
- Cadastro com todas as regras de validação da especificação (nome, CPF com
  dígito verificador, CEP com preenchimento automático via API ViaCEP com
  fallback manual, telefones no formato `(+55)XX-XXXXXXXX`, login com 6
  letras, senha com 8 letras e hash bcrypt).
- Login → 2FA com pergunta aleatória entre 3 opções, bloqueio após 3
  tentativas com a mensagem exigida.
- Consulta de Usuário com busca por substring e exclusão (com modal de
  confirmação), acessível somente ao master.
- Tela de Log com filtro por nome, CPF ou todos, mais recentes primeiro.
- Feedback ao usuário via toasts/modais (sem uso de `alert()`).
- Layout responsivo (desktop, tablet, mobile) com identidade visual clara,
  reaproveitando a estética do protótipo PetID (verde, âmbar, carteirinha
  digital, tipografia Manrope/IBM Plex Mono).
- **Desafio Plus:** exportação da lista de usuários em PDF + barra de
  acessibilidade (alto contraste e aumento/diminuição de fonte).

## Sobre este back-end

Este projeto é a versão back-end (PHP + MySQL) do protótipo estático **PetID**
feito no Módulo I de Front-End. A identidade visual (verde, âmbar, carteirinha
digital, cantos arredondados) foi mantida integralmente — o que foi adicionado
aqui é toda a camada de autenticação, sessão, perfis de usuário e persistência
em banco de dados exigida pela especificação do Módulo II.

## Observações

- O usuário master só é criado via script SQL (`sql/schema.sql`), conforme a
  especificação — não existe cadastro de master pela interface.
- Diagrama ER gerado em `assets/images/der-diagram.png`, reaproveitado na
  Tela "Modelo do BD".
