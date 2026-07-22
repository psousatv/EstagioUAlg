<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

try {

    include "../../../global/config/dbConn.php";

    if (!isset($myConn)) {
        throw new Exception("Ligação PDO não encontrada.");
    }

    $sql = "SELECT proces_check,
                   CONCAT('(', proces_estado, ') ', proces_estado_nome) AS proces_estado_nome,
                   proces_nome,
                   e.ent_nome AS entidade,
                   h.historico_descr_nome AS movimento,
                   h.historico_dataemissao AS agendamento,
                   h.historico_datamov,
                   h.historico_doc,
                   h.historico_num AS observacoes,
                   h.historico_notas,
                   h.historico_valor,
                   h.historico_pendente
            FROM processo
            JOIN historico h ON h.historico_proces_check = proces_check
            JOIN entidade e ON e.ent_cod = proces_ent_Cod
            WHERE proces_report_valores = 1
            AND h.historico_datamov <= :hoje
            
            AND h.historico_pendente = -1
            ORDER BY h.historico_descr_nome, e.ent_nome, h.historico_dataemissao";

    $stmt = $myConn->prepare($sql);
    $stmt->execute([
        ':hoje'    => date("Y-m-d")
    ]);

    $processos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($processos);
    exit;

} catch (Throwable $e) {

    http_response_code(500);
    echo json_encode([
        "erro" => true,
        "mensagem" => $e->getMessage()
    ]);
    exit;
}