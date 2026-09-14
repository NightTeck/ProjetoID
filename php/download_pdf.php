<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/SimplePDF.php';

exigirPerfil('master');

$pdo = getConexao();
$stmt = $pdo->query('SELECT nome, login, email, cpf, cidade, uf, criado_em FROM usuarios WHERE perfil = "comum" ORDER BY nome ASC');
$usuarios = $stmt->fetchAll();

$pdf = new SimplePDF();
$pdf->escreverLinha('PetID - Lista de Usuarios Cadastrados', 15, true);
$pdf->escreverLinha('Gerado em ' . date('d/m/Y H:i'), 9);
$pdf->espaco(14);

$pdf->escreverLinha(str_pad('Nome', 28) . str_pad('Login', 9) . str_pad('CPF', 16) . str_pad('Cidade/UF', 20) . 'Cadastrado em', 9, true);
$pdf->espaco(4);

if (empty($usuarios)) {
    $pdf->escreverLinha('Nenhum usuario comum cadastrado no momento.', 10);
} else {
    foreach ($usuarios as $u) {
        $linha = str_pad(mb_substr($u['nome'], 0, 26), 28)
            . str_pad($u['login'], 9)
            . str_pad(formatarCPF($u['cpf']), 16)
            . str_pad(($u['cidade'] ?: '-') . '/' . ($u['uf'] ?: '-'), 20)
            . date('d/m/Y', strtotime($u['criado_em']));
        $pdf->escreverLinha($linha, 9);
    }
}

$pdf->espaco(10);
$pdf->escreverLinha('Total de usuarios: ' . count($usuarios), 10, true);

$conteudo = $pdf->saida();

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="lista-usuarios-petid.pdf"');
header('Content-Length: ' . strlen($conteudo));
echo $conteudo;
