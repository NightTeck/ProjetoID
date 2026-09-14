<?php
/**
 * Configuração de conexão com o Banco de Dados (MySQL via PDO).
 * Ajuste as constantes abaixo de acordo com o seu ambiente.
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'petid_db');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

function getConexao(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        $opcoes = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $opcoes);
        } catch (PDOException $e) {
            // Loga o erro real no servidor e envia o usuário para a Tela de Erro
            error_log('Erro de conexão com o banco: ' . $e->getMessage());
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['erro_mensagem'] = 'Não foi possível conectar ao banco de dados. Tente novamente mais tarde.';
            header('Location: erro.php');
            exit;
        }
    }

    return $pdo;
}
