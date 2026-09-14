-- =========================================================================
-- PETID — Script de criação do Banco de Dados
-- Curso: ADS | Disciplina: Projeto de Desenvolvimento em Back-End
-- SGBD: MySQL 8+
-- =========================================================================

CREATE DATABASE IF NOT EXISTS petid_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE petid_db;

-- -------------------------------------------------------------------------
-- Tabela: usuarios
-- Armazena tanto o perfil master quanto os usuários comuns.
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS logs_autenticacao;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  nome               VARCHAR(80)  NOT NULL,
  data_nascimento    DATE         NOT NULL,
  sexo               ENUM('Feminino','Masculino','Outro') NOT NULL,
  nome_materno       VARCHAR(80)  NOT NULL,
  cpf                CHAR(11)     NOT NULL,
  email              VARCHAR(120) NOT NULL,
  telefone_celular   VARCHAR(20)  NOT NULL,
  telefone_fixo      VARCHAR(20)  NOT NULL,
  cep                CHAR(8)      NOT NULL,
  logradouro         VARCHAR(120) NULL,
  numero             VARCHAR(10)  NULL,
  complemento        VARCHAR(60)  NULL,
  bairro             VARCHAR(80)  NULL,
  cidade             VARCHAR(80)  NULL,
  uf                 CHAR(2)      NULL,
  login              VARCHAR(6)   NOT NULL,
  senha_hash         VARCHAR(255) NOT NULL,
  perfil             ENUM('master','comum') NOT NULL DEFAULT 'comum',
  criado_em          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_cpf   (cpf),
  UNIQUE KEY uq_usuarios_login (login),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------
-- Tabela: logs_autenticacao
-- Guarda cada tentativa de 2FA (sucesso ou falha) para a Tela de Log.
-- -------------------------------------------------------------------------
CREATE TABLE logs_autenticacao (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  nome            VARCHAR(80) NOT NULL,
  cpf             CHAR(11)    NOT NULL,
  segundo_fator   VARCHAR(60) NOT NULL,
  sucesso         TINYINT(1)  NOT NULL DEFAULT 1,
  data_hora       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------
-- Usuário MASTER (criado somente via script SQL, conforme especificação).
--
-- Login  : master
-- Senha  : master12   (8 caracteres alfabéticos, já armazenada com hash bcrypt)
-- Pergunta 2FA usa os campos já cadastrados abaixo:
--   Nome da mãe -> "Maria Aparecida Souza"
--   Data nasc.  -> 1990-01-01
--   CEP         -> 22000000
--
-- O hash abaixo foi gerado com o mesmo algoritmo bcrypt usado pela função
-- password_hash() do PHP (compatível com password_verify()).
-- -------------------------------------------------------------------------
INSERT INTO usuarios (
  nome, data_nascimento, sexo, nome_materno, cpf, email,
  telefone_celular, telefone_fixo, cep, logradouro, numero, complemento,
  bairro, cidade, uf, login, senha_hash, perfil
) VALUES (
  'Administrador Master do Sistema', '1990-01-01', 'Outro', 'Maria Aparecida Souza',
  '00000000000', 'admin@petid.app',
  '(+55)21-999999999', '(+55)21-33334444', '22000000',
  'Rua Central', '1', 'Sala 1', 'Centro', 'Rio de Janeiro', 'RJ',
  'master', '$2y$10$xZrrkLF9R7D.hU6KPz8RLOW9ZMDxTzy73hE.NZmhZCxk2E8VMs7l.', 'master'
);
