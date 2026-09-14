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
$acao = $_REQUEST['acao'] ?? '';

if ($acao === 'buscar') {
    $termo = trim($_GET['termo'] ?? '');

    $sql = 'SELECT id, nome, login, email, cpf, cidade, uf, criado_em
            FROM usuarios WHERE perfil = "comum"';
    $params = [];

    if ($termo !== '') {
        $sql .= ' AND nome LIKE :termo';
        $params[':termo'] = '%' . $termo . '%';
    }
    $sql .= ' ORDER BY nome ASC';

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $usuarios = $stmt->fetchAll();

        foreach ($usuarios as &$u) {
            $u['cpf'] = formatarCPF($u['cpf']);
            $u['criado_em'] = date('d/m/Y H:i', strtotime($u['criado_em']));
        }

        echo json_encode(['sucesso' => true, 'usuarios' => $usuarios]);
    } catch (PDOException $e) {
        error_log('Erro na busca de usuários: ' . $e->getMessage());
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao consultar usuários.']);
    }
    exit;
}

if ($acao === 'excluir' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int) ($_POST['id'] ?? 0);

    if ($id <= 0) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Usuário inválido.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('SELECT perfil FROM usuarios WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $alvo = $stmt->fetch();

        if (!$alvo) {
            echo json_encode(['sucesso' => false, 'mensagem' => 'Usuário não encontrado.']);
            exit;
        }
        if ($alvo['perfil'] === 'master') {
            echo json_encode(['sucesso' => false, 'mensagem' => 'O usuário master não pode ser excluído.']);
            exit;
        }

        $stmt = $pdo->prepare('DELETE FROM usuarios WHERE id = :id');
        $stmt->execute([':id' => $id]);

        echo json_encode(['sucesso' => true]);
    } catch (PDOException $e) {
        error_log('Erro ao excluir usuário: ' . $e->getMessage());
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao excluir usuário.']);
    }
    exit;
}

echo json_encode(['sucesso' => false, 'mensagem' => 'Ação inválida.']);
