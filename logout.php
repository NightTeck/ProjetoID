<?php
require_once __DIR__ . '/php/auth.php';

session_unset();
session_destroy();

session_start();
$_SESSION['flash_msg'] = 'Sessão encerrada com sucesso. Até logo!';
$_SESSION['flash_tipo'] = 'success';

header('Location: login.php');
exit;
