<?php
include "../../../global/config/dbConn.php";
header('Content-Type: application/json; charset=utf-8');

$itemProcurado = $_GET['itemProcurado'] ?? null;
$anoCorrente   = $_GET['anoCorrente'] ?? date('Y');

try {

    // === ENTIDADES ===
    $sqlEntidades = "SELECT
        ent_cod,
        ent_nome AS entidade,
        ent_nif AS contribuinte
    FROM entidade
    ORDER BY ent_nome";

    $stmt = $myConn->prepare($sqlEntidades);
    $stmt->execute();
    $entidades = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // === PROCESSOS ===
    $sqlProcessos = "SELECT
        proces_check,
        proces_ent_cod,
        proces_padm AS padm,
        pr.proced_regime AS regime,
        proces_nome AS designacao,
        COALESCE(SUM(h.adjudicado), 0) AS adjudicado,
        COALESCE(SUM(f.faturado), 0) AS faturado
    FROM processo
    LEFT JOIN procedimento pr ON pr.proced_cod = proces_proced_cod
    LEFT JOIN (
        SELECT 
            historico_proces_check,
            SUM(CASE 
                WHEN historico_descr_cod = 14 THEN historico_valor 
                ELSE 0 
            END) AS adjudicado
        FROM historico
        GROUP BY historico_proces_check
    ) h ON h.historico_proces_check = proces_check
    LEFT JOIN (
        SELECT 
            fact_proces_check,
            SUM(CASE 
                WHEN fact_tipo IN ('FTN','FTC','NC') THEN fact_valor 
                ELSE 0 
            END) AS faturado
        FROM factura
        GROUP BY fact_proces_check
    ) f ON f.fact_proces_check = proces_check
    WHERE proces_report_valores = 1
    GROUP BY 
        proces_check,
        proces_ent_cod,
        proces_padm,
        pr.proced_regime,
        proces_nome
    ORDER BY proces_nome";

    $stmt = $myConn->prepare($sqlProcessos);
    $stmt->execute();
    $processos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // === FATURAS ===
    $sqlFaturas = "SELECT
        fact_proces_check,
        fact_auto_num AS auto_num,
        fact_auto_data AS data_auto,
        fact_expediente AS expediente,
        fact_num AS fatura,
        fact_data AS fatura_data,
        fact_valor AS fatura_valor
    FROM factura
    ORDER BY fact_data";

    $stmt = $myConn->prepare($sqlFaturas);
    $stmt->execute();
    $faturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // === MAPA DE PROCESSOS (com faturas) ===
    $mapProc = [];

    foreach ($processos as $processo) {
        $processo['faturas'] = [];
        $mapProc[$processo['proces_check']] = $processo;
    }

    // === ASSOCIAR FATURAS AOS PROCESSOS ===
    foreach ($faturas as $fatura) {
        $procCheck = $fatura['fact_proces_check'] ?? null;

        if ($procCheck && isset($mapProc[$procCheck])) {
            $mapProc[$procCheck]['faturas'][] = $fatura;
        }
    }

    // === MAPA DE ENTIDADES ===
    $mapEnt = [];

    foreach ($entidades as $entidade) {
        $entidade['processos'] = [];
        $mapEnt[$entidade['ent_cod']] = $entidade;
    }

    // === AGRUPAR PROCESSOS (já com faturas) NAS ENTIDADES ===
    foreach ($mapProc as $processo) {
        $codEnt = $processo['proces_ent_cod'] ?? null;

        if ($codEnt && isset($mapEnt[$codEnt])) {
            $mapEnt[$codEnt]['processos'][] = $processo;
        }
    }

    // === REINDEXAR ARRAY FINAL ===
    $resultado = array_values($mapEnt);

    // === OUTPUT FINAL ===
    echo json_encode([
        "data" => $resultado
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        "error" => $e->getMessage()
    ]);
}
?>