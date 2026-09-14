<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

if (!estaAutenticado() || perfilAtual() !== 'master') {
    http_response_code(403);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Acesso não autorizado.']);
    exit;
}

$pdo = getConexao();
$filtro = $_GET['filtro'] ?? 'todos';
$termo = trim($_GET['termo'] ?? '');

$sql = 'SELECT nome, cpf, segundo_fator, sucesso, data_hora FROM logs_autenticacao WHERE 1=1';
$params = [];

if ($termo !== '') {
    if ($filtro === 'cpf') {
        $sql .= ' AND cpf LIKE :termo';
        $params[':termo'] = '%' . somenteNumeros($termo) . '%';
    } elseif ($filtro === 'nome') {
        $sql .= ' AND nome LIKE :termo';
        $params[':termo'] = '%' . $termo . '%';
    } else {
        $sql .= ' AND (nome LIKE :termo OR cpf LIKE :termoCpf)';
        $params[':termo'] = '%' . $termo . '%';
        $params[':termoCpf'] = '%' . somenteNumeros($termo) . '%';
    }
}

$sql .= ' ORDER BY data_hora DESC LIMIT 200';

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $logs = $stmt->fetchAll();

    foreach ($logs as &$l) {
        $l['cpf'] = formatarCPF($l['cpf']);
        $l['data_hora'] = date('d/m/Y H:i:s', strtotime($l['data_hora']));
    }

    echo json_encode(['sucesso' => true, 'logs' => $logs]);
} catch (PDOException $e) {
    error_log('Erro ao consultar logs: ' . $e->getMessage());
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao consultar logs.']);
}
