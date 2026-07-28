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
                CONCAT('(', p.proces_estado, ') ', p.proces_estado_nome) AS proces_estado_nome,
                p.proces_nome,
                p.proces_prz_exec,
                h.data_adjudicacao,
                h.data_contrato,
                h.data_consignacao,
                h.data_pss
            FROM processo p
            INNER JOIN (
                SELECT
                    historico_proces_check,
                    MAX(CASE WHEN historico_descr_cod = 14 THEN historico_dataemissao END) AS data_adjudicacao,
                    MAX(CASE WHEN historico_descr_cod = 17 THEN historico_dataemissao END) AS data_contrato,
                    MAX(CASE WHEN historico_descr_cod = 18 THEN historico_dataemissao END) AS data_consignacao,
                    MAX(CASE WHEN historico_descr_cod = 60 THEN historico_dataemissao END) AS data_pss
                FROM historico
                GROUP BY historico_proces_check
            ) h ON h.historico_proces_check = p.proces_check
            WHERE p.proces_estado BETWEEN 208 AND 215
            AND p.proces_report_valores = :reporta
            AND h.data_adjudicacao IS NOT NULL
            ORDER BY p.proces_cpv_sigla, p.proces_check";

    $stmt = $myConn->prepare($sql);

    $stmt->execute(['reporta' => '1'] );

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