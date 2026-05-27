<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

try {

    include "../../../global/config/dbConn.php";

    if (!isset($myConn)) {
        throw new Exception("Ligação PDO não encontrada.");
    }

    $sql = "SELECT 
                p.proces_check,
                p.proces_cpv_sigla,
                p.proces_nome,
                p.proces_prz_exec,
                h.data_adjudicacao,
                h.data_contrato,
                h.data_consignacao,
                h.data_pss
            FROM processo p
            LEFT JOIN (
                SELECT
                    historico_proces_check,
                    MAX(CASE WHEN historico_descr_cod = 14 THEN historico_dataemissao ELSE 0 END) AS data_adjudicacao,
                    MAX(CASE WHEN historico_descr_cod = 17 THEN historico_dataemissao ELSE 0 END) AS data_contrato,
                    MAX(CASE WHEN historico_descr_cod = 18 THEN historico_dataemissao ELSE 0 END) AS data_consignacao,
                    MAX(CASE WHEN historico_descr_cod = 60 THEN historico_dataemissao ELSE 0 END) AS data_pss
                FROM historico
                GROUP BY historico_proces_check
                ) h ON h.historico_proces_check = p.proces_check
            WHERE proces_estado_nome = :estado
            AND proces_report_valores = :reporta
            AND h.data_adjudicacao > 0
            ORDER BY p.proces_cpv_sigla, p.proces_check";

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