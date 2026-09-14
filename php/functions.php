<?php
/**
 * Funções utilitárias compartilhadas pelo Back-End.
 */

/** Remove tudo que não for dígito. */
function somenteNumeros(string $valor): string
{
    return preg_replace('/\D/', '', $valor);
}

/** Valida um CPF conferindo os dígitos verificadores. */
function validarCPF(string $cpf): bool
{
    $cpf = somenteNumeros($cpf);

    if (strlen($cpf) !== 11) {
        return false;
    }
    // Rejeita sequências como 000.000.000-00, 111.111.111-11, etc.
    if (preg_match('/^(\d)\1{10}$/', $cpf)) {
        return false;
    }

    for ($t = 9; $t < 11; $t++) {
        $soma = 0;
        for ($c = 0; $c < $t; $c++) {
            $soma += $cpf[$c] * (($t + 1) - $c);
        }
        $digito = (($soma * 10) % 11) % 10;
        if ($cpf[$t] != $digito) {
            return false;
        }
    }

    return true;
}

/** Formata um CPF para exibição: 000.000.000-00 */
function formatarCPF(string $cpf): string
{
    $cpf = somenteNumeros($cpf);
    return substr($cpf, 0, 3) . '.' . substr($cpf, 3, 3) . '.' . substr($cpf, 6, 3) . '-' . substr($cpf, 9, 2);
}

/** Valida o formato de telefone: (+55)XX-XXXXXXXX ou (+55)XX-XXXXXXXXX */
function validarTelefone(string $telefone): bool
{
    return (bool) preg_match('/^\(\+55\)\d{2}-\d{8,9}$/', $telefone);
}

/** Valida nome: apenas letras e espaços, entre 15 e 80 caracteres. */
function validarNome(string $nome): bool
{
    $len = mb_strlen(trim($nome));
    if ($len < 15 || $len > 80) {
        return false;
    }
    return (bool) preg_match('/^[\p{L}\s]+$/u', $nome);
}

/** Valida login: exatamente 6 caracteres alfabéticos. */
function validarLogin(string $login): bool
{
    return (bool) preg_match('/^[A-Za-z]{6}$/', $login);
}

/** Valida senha: exatamente 8 caracteres alfabéticos. */
function validarSenha(string $senha): bool
{
    return (bool) preg_match('/^[A-Za-z]{8}$/', $senha);
}

/** Valida e-mail usando o filtro nativo do PHP. */
function validarEmail(string $email): bool
{
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

/** Valida CEP: exatamente 8 dígitos. */
function validarCEP(string $cep): bool
{
    return (bool) preg_match('/^\d{8}$/', somenteNumeros($cep));
}

/**
 * Sorteia uma das 3 perguntas de segurança do 2FA.
 * Retorna um array ['chave' => ..., 'pergunta' => ...]
 */
function sortearPergunta2FA(): array
{
    $perguntas = [
        'nome_materno'    => 'Qual o nome da sua mãe?',
        'data_nascimento' => 'Qual a data do seu nascimento? (dd/mm/aaaa)',
        'cep'             => 'Qual o CEP do seu endereço?',
    ];
    $chave = array_rand($perguntas);
    return ['chave' => $chave, 'pergunta' => $perguntas[$chave]];
}

/** Rótulo curto do fator 2FA, usado na Tela de Log. */
function rotulo2FA(string $chave): string
{
    $rotulos = [
        'nome_materno'    => 'Nome da mãe',
        'data_nascimento' => 'Data de nascimento',
        'cep'             => 'CEP do endereço',
    ];
    return $rotulos[$chave] ?? $chave;
}

/**
 * Confere a resposta do 2FA comparando com o valor cadastrado no banco.
 */
function conferirResposta2FA(string $chave, string $resposta, array $usuario): bool
{
    $resposta = trim($resposta);

    switch ($chave) {
        case 'nome_materno':
            return mb_strtolower($resposta) === mb_strtolower($usuario['nome_materno']);
        case 'data_nascimento':
            // aceita dd/mm/aaaa
            $partes = explode('/', $resposta);
            if (count($partes) === 3) {
                $formatado = $partes[2] . '-' . str_pad($partes[1], 2, '0', STR_PAD_LEFT) . '-' . str_pad($partes[0], 2, '0', STR_PAD_LEFT);
                return $formatado === $usuario['data_nascimento'];
            }
            return $resposta === $usuario['data_nascimento'];
        case 'cep':
            return somenteNumeros($resposta) === $usuario['cep'];
        default:
            return false;
    }
}

/** Registra uma linha no log de autenticação. */
function registrarLog(PDO $pdo, array $usuario, string $segundoFator, bool $sucesso): void
{
    $stmt = $pdo->prepare(
        'INSERT INTO logs_autenticacao (usuario_id, nome, cpf, segundo_fator, sucesso)
         VALUES (:usuario_id, :nome, :cpf, :segundo_fator, :sucesso)'
    );
    $stmt->execute([
        ':usuario_id'    => $usuario['id'],
        ':nome'          => $usuario['nome'],
        ':cpf'           => $usuario['cpf'],
        ':segundo_fator' => $segundoFator,
        ':sucesso'       => $sucesso ? 1 : 0,
    ]);
}

/** Sanitiza uma string simples de entrada. */
function s(string $valor): string
{
    return htmlspecialchars(trim($valor), ENT_QUOTES, 'UTF-8');
}
