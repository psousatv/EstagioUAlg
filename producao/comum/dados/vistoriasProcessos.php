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
                   proces_nome,
                   e.ent_nome AS entidade,
                   h.historico_dataemissao AS agendamento,
                   h.historico_datamov,
                   h.historico_doc,
                   h.historico_notas,
                   h.historico_valor
            FROM processo
            JOIN historico h ON h.historico_proces_check = proces_check
            JOIN entidade e ON e.ent_cod = proces_ent_Cod
            WHERE proces_estado_nome <> 'Em Curso'
            AND proces_report_valores = 1
            AND h.historico_datamov <= :hoje
            AND (
            h.historico_descr_nome = 'Auto Vistoria'
            OR h.historico_descr_nome = 'Receção Definitiva'
            )
            AND h.historico_obs = 'Programado'
            ORDER BY h.historico_dataemissao, e.ent_nome";

    $stmt = $myConn->prepare($sql);
    $stmt->execute(['hoje' => date("Y-m-d")]);
    //$stmt->execute(['estado' => 'Em Curso',
    //                'reporta' => '1',
    //                'hoje' => date("Y-m-d"),
    //                'vistoria' => 'Sem anomalias',
    //                'documento' => 'Auto Vistoria',
    //                'definitiva' => 'Receção Definitiva'
    //                ]);

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