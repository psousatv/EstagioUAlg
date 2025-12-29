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
        orc_tipo AS tipo,
        orc_regime AS regime,
        orc_conta_descritiva AS descritivo,
        orc_valor_previsto AS previsto,
        SUM(orc_valor_previsto) AS total_previsto,

        (
        SELECT COALESCE(SUM(h14.historico_valor), 0) 
        FROM historico h14
        LEFT JOIN processo p ON p.proces_orc_check = orc_check
        WHERE h14.historico_proces_check = p.proces_check
        
        AND h14.historico_descr_cod = 14
        ) AS total_adjudicado,

        (
        SELECT COALESCE(SUM(f.fact_valor), 0) 
        FROM factura f
        LEFT JOIN processo p ON p.proces_orc_check = orc_check
        WHERE f.fact_proces_check = p.proces_check
        AND YEAR(f.fact_data) = :anoCorrente
        ) AS total_faturado

        FROM orcamento
        WHERE orc_rubrica = :itemProcurado
        AND orc_ano = :anoCorrente
        GROUP BY orc_check
        ORDER BY tipo, regime";

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
            proces_linha_orc AS linha_orc,
            proces_linha_se AS linha_se,
            proces_padm AS padm,
            proc.proced_regime AS regime,
            proces_nome AS designacao,
            proces_val_max AS previsto,
            (
            SELECT COALESCE(SUM(h14.historico_valor), 0) 
            FROM historico h14 
            WHERE h14.historico_proces_check = proces_check
            AND h14.historico_descr_cod = 14) AS adjudicado,
            (
            SELECT COALESCE(SUM(f.fact_valor), 0)
            FROM factura f 
            WHERE f.fact_proces_check = proces_check
            AND YEAR(f.fact_data) = $anoCorrente) AS faturado
            FROM processo
            INNER JOIN procedimento proc ON proc.proced_cod = proces_proced_cod
            WHERE proces_orc_check IN ($placeholders)
            AND proces_report_valores = 1
            GROUP BY proces_check
            ORDER BY proces_nome";

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