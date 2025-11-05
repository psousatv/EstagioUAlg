<?php
include "../../../global/config/dbConn.php";
header('Content-Type: application/json; charset=utf-8');

$orcamentoItem = $_GET['orcamentoItem'] ?? null;
$anoCorrente   = $_GET['anoCorrente'] ?? date('Y');

if (!$orcamentoItem) {
    echo json_encode(["error" => "Parâmetro 'orcamentoItem' é obrigatório."]);
    exit;
}

try {
    // === RUBRICA ===
    $sqlRubricas = "
        SELECT
            rub_cod AS rubrica,
            rub_tipo AS tipo,
            rub_rubrica AS grupo,
            rub_item AS descritivo
        FROM rubricas
        WHERE rub_cod = :orcamentoItem
    ";

    $stmtRub = $myConn->prepare($sqlRubricas);
    $stmtRub->bindParam(':orcamentoItem', $orcamentoItem, PDO::PARAM_INT);
    $stmtRub->execute();
    $rubrica = $stmtRub->fetch(PDO::FETCH_ASSOC);

    // === ORÇAMENTO (otimizado com JOINs agregados) ===
    $sqlOrcamento = "
        SELECT  
            o.orc_check,
            o.orc_tipo AS tipo,
            o.orc_regime AS regime,
            o.orc_conta_agregadora AS agregadora,
            o.orc_conta_descritiva AS descritivo,
            o.orc_valor_previsto AS previsto,
            SUM(o.orc_valor_previsto) AS total_previsto,
            COALESCE(SUM(DISTINCT h14.total_adjudicado), 0) AS total_adjudicado,
            COALESCE(SUM(DISTINCT f.total_faturado), 0) AS total_faturado
        FROM orcamento o
        LEFT JOIN (
            SELECT 
                p.proces_orc_check, 
                SUM(h.historico_valor) AS total_adjudicado
            FROM processo p
            JOIN historico h ON h.historico_proces_check = p.proces_check
            WHERE h.historico_descr_cod = 14
            GROUP BY p.proces_orc_check
        ) h14 ON h14.proces_orc_check = o.orc_check
        LEFT JOIN (
            SELECT 
                p.proces_orc_check, 
                SUM(fa.fact_valor) AS total_faturado
            FROM processo p
            JOIN factura fa ON fa.fact_proces_check = p.proces_check
            WHERE p.proces_report_valores = 1
            GROUP BY p.proces_orc_check
        ) f ON f.proces_orc_check = o.orc_check
        WHERE o.orc_rubrica = :orcamentoItem
        AND o.orc_ano = :anoCorrente
        GROUP BY o.orc_check
        ORDER BY o.orc_conta_descritiva
    ";

    $stmtOrc = $myConn->prepare($sqlOrcamento);
    $stmtOrc->bindParam(':orcamentoItem', $orcamentoItem, PDO::PARAM_INT);
    $stmtOrc->bindParam(':anoCorrente', $anoCorrente, PDO::PARAM_INT);
    $stmtOrc->execute();
    $orcamentoList = $stmtOrc->fetchAll(PDO::FETCH_ASSOC);

    // === PROCESSOS ===
    $orcIds = array_column($orcamentoList, 'orc_check');
    $processos = [];

    if (!empty($orcIds)) {
        $placeholders = implode(',', array_fill(0, count($orcIds), '?'));

        $sqlProcessos = "
            SELECT
                p.proces_check,
                p.proces_orc_check,
                p.proces_linha_orc AS linha_orc,
                p.proces_linha_se AS linha_se,
                p.proces_padm AS padm,
                proc.proced_regime AS regime,
                p.proces_nome AS designacao,
                (SELECT COALESCE(SUM(h3.historico_valor), 0) 
                 FROM historico h3 
                 WHERE h3.historico_proces_check = p.proces_check
                 AND h3.historico_descr_cod = 3) AS consulta,
                (SELECT COALESCE(SUM(h14.historico_valor), 0) 
                 FROM historico h14 
                 WHERE h14.historico_proces_check = p.proces_check
                 AND h14.historico_descr_cod = 14) AS adjudicado,
                (SELECT COALESCE(SUM(f.fact_valor), 0)
                 FROM factura f 
                 WHERE f.fact_proces_check = p.proces_check) AS faturado
            FROM processo p
            INNER JOIN procedimento proc ON proc.proced_cod = p.proces_proced_cod
            WHERE p.proces_orc_check IN ($placeholders)
            AND p.proces_report_valores = 1
            GROUP BY p.proces_check
            ORDER BY p.proces_nome
        ";

        $stmtProc = $myConn->prepare($sqlProcessos);
        $stmtProc->execute($orcIds);
        $processos = $stmtProc->fetchAll(PDO::FETCH_ASSOC);
    }

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