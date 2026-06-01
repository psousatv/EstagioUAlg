<?php
include "../../../global/config/dbConn.php";
header('Content-Type: application/json; charset=utf-8');

$itemProcurado = $_GET['itemProcurado'] ?? null;
$anoCorrente   = $_GET['anoCorrente'] ?? date('Y');

if (!$itemProcurado) {
    echo json_encode(["error" => "Parâmetro 'itemProcurado' é obrigatório."]);
    exit;
}

try {
    // === RUBRICA ===
    $sqlRubricas = "SELECT
        rub_cod AS rubrica,
        rub_tipo AS tipo,
        rub_rubrica AS grupo,
        rub_item AS descritivo
        FROM rubricas
        WHERE rub_cod = :itemProcurado";

    $stmtRub = $myConn->prepare($sqlRubricas);
    $stmtRub->bindParam(':itemProcurado', $itemProcurado, PDO::PARAM_INT);
    $stmtRub->execute();
    $rubrica = $stmtRub->fetch(PDO::FETCH_ASSOC);

    // === ORÇAMENTO ===
    $sqlOrcamento = "SELECT
                        orc_check,
                        orc_ano AS ano,
                        orc_tipo AS tipo,
                        orc_regime AS regime,
                        orc_conta_descritiva AS descritivo,
                        orc_valor_previsto AS orcamento,
                        COALESCE(SUM(orc_valor_previsto), 0) AS total_orcamento,
                        (SELECT 
                            COALESCE(SUM(h.historico_valor), 0) 
                        FROM historico h
                        LEFT JOIN processo p ON p.proces_orc_check = orc_check
                        WHERE h.historico_proces_check = p.proces_check
                        AND h.historico_descr_cod IN (9, 14)
                        AND p.proces_report_valores = 1
                        ) AS total_adjudicado,
                        (SELECT 
                            COALESCE(SUM(f.fact_valor), 0) 
                        FROM factura f
                        LEFT JOIN processo p ON p.proces_orc_check = orc_check
                        WHERE f.fact_proces_check = p.proces_check
                        AND YEAR(f.fact_data) = $anoCorrente
                        AND f.fact_tipo IN ('FTN','FTC','NC')
                        AND p.proces_report_valores = 1
                        ) AS total_faturado
                        FROM orcamento
                        WHERE orc_rubrica = :itemProcurado
                        AND orc_ano = :anoCorrente
                        GROUP BY orc_check
                        ORDER BY regime, tipo";

    $stmtOrc = $myConn->prepare($sqlOrcamento);
    $stmtOrc->bindParam(':itemProcurado', $itemProcurado, PDO::PARAM_INT);
    $stmtOrc->bindParam(':anoCorrente', $anoCorrente, PDO::PARAM_INT);
    $stmtOrc->execute();
    $orcamentoList = $stmtOrc->fetchAll(PDO::FETCH_ASSOC);

    // === PROCESSOS ===
    $orcIds = array_column($orcamentoList, 'orc_check');
    $processos = [];

    if (!empty($orcIds)) {
        $placeholders = implode(',', array_fill(0, count($orcIds), '?'));

        $sqlProcessos = "SELECT
                            proces_check,
                            proces_orc_check,
                            proces_linha_orc AS linha_orcamento,
                            proces_linha_se AS linha_se,
                            proces_padm AS padm,
                            proc.proced_regime AS regime,
                            proces_nome AS designacao,
                            proces_val_max AS val_max,
                            proces_report_valores,
                            COALESCE(h.adjudicado, 0) AS adjudicado,
                            COALESCE(f.faturado, 0) AS faturado
                        FROM processo
                        LEFT JOIN (
                            SELECT
                                h.historico_proces_check,
                                SUM(h.historico_valor) AS adjudicado
                            FROM historico h
                            INNER JOIN processo p
                                ON p.proces_check = h.historico_proces_check
                            AND p.proces_report_valores = 1
                            WHERE h.historico_descr_cod IN (9,14)
                            GROUP BY h.historico_proces_check
                        ) h ON h.historico_proces_check = proces_check
                        LEFT JOIN (
                            SELECT
                                f.fact_proces_check,
                                SUM(f.fact_valor) AS faturado
                            FROM factura f
                            INNER JOIN processo p
                                ON p.proces_check = f.fact_proces_check
                            AND p.proces_report_valores = 1
                            WHERE f.fact_tipo IN ('FTN','FTC','NC')
                            AND YEAR(f.fact_data) = $anoCorrente
                            GROUP BY f.fact_proces_check
                        ) f ON f.fact_proces_check = proces_check
                        LEFT JOIN procedimento proc
                            ON proc.proced_cod = proces_proced_cod
                        WHERE proces_orc_check IN ($placeholders)
                        AND proces_report_valores = 1
                        ORDER BY proces_nome;";

        $stmtProc = $myConn->prepare($sqlProcessos);
        $stmtProc->execute($orcIds);
        $processos = $stmtProc->fetchAll(PDO::FETCH_ASSOC);
    }

    // === FATURAÇÃO ===

    // === PLANO DE PAGAMENTOS ===
    // === O apuramento do saldo deve ser através do previsto
    // === no plano_pagamentos e o faturado

    // === AGRUPAR PROCESSOS POR ORÇAMENTO ===
    $mapP = [];
    foreach ($processos as $proc) {
        $mapP[$proc['proces_orc_check']][] = $proc;
    }

    foreach ($orcamentoList as &$orc) {
        $orc['processos'] = $mapP[$orc['orc_check']] ?? [];
    }

    // === RETORNO FINAL: Rubrica + Data ===
    echo json_encode([
        "rubrica" => $rubrica,
        "data"    => $orcamentoList
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>