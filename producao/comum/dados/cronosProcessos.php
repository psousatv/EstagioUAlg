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
                   proces_data_adjudicacao,
                   proces_data_contrato,
                   proces_data_csgn,
                   proces_prz_exec
            FROM processo
            WHERE proces_estado_nome = :estado
            AND proces_report_valores = :reporta
            ORDER BY proces_cpv_sigla ASC";

    $stmt = $myConn->prepare($sql);
    //$stmt->bindParam(':estado', 'Em Curso', PDO::PARAM_STR);
    //$stmt->bindParam(':reporta', int('1'), PDO::PARAM_INT);
    //$stmt->execute();
    $stmt->execute(['estado' => 'Em Curso','reporta' => '1'] );

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