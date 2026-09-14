<?php
/**
 * Gerenciamento de sessão e controle de acesso por perfil de usuário.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/** Verifica se o usuário está totalmente autenticado (login + 2FA). */
function estaAutenticado(): bool
{
    return isset($_SESSION['auth']) && $_SESSION['auth'] === true;
}

/** Exige autenticação completa; caso contrário, redireciona para o login. */
function exigirLogin(): void
{
    if (!estaAutenticado()) {
        header('Location: login.php');
        exit;
    }
}

/** Exige que o usuário logado tenha um perfil específico ('master' ou 'comum'). */
function exigirPerfil(string $perfil): void
{
    exigirLogin();
    if ($_SESSION['perfil'] !== $perfil) {
        $_SESSION['erro_mensagem'] = 'Você não tem permissão para acessar esta página.';
        header('Location: erro.php');
        exit;
    }
}

/** Retorna o perfil do usuário logado, ou null. */
function perfilAtual(): ?string
{
    return $_SESSION['perfil'] ?? null;
}
