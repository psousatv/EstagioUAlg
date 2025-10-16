<?php

// Conexão PDO
include "../../../global/config/dbConn.php";

// Entrada
$orcamentoItem = $_GET['orcamentoItem'] ?? null;
$anoCorrente = $_GET['anoCorrente'] ?? date('Y');

if (!$orcamentoItem) {
    echo json_encode(["error" => "Parâmetro 'orcamentoItem' é obrigatório."]);
    exit;
}

// Consulta do orçamento por rubrica
$sqlOrcamento = "
    SELECT  
        orc_check,
        orc_tipo AS tipo,
        orc_regime AS regime,
        orc_conta_agregadora AS agregadora,
        orc_conta_descritiva AS descritivo,
        orc_valor_previsto AS previsto,
        SUM(orc_valor_previsto) AS total_previsto,
        (
            SELECT SUM(COALESCE(historico_valor, 1))
            FROM historico
            JOIN processo ON proces_check = historico_proces_check
            WHERE proces_orc_check = orcamento.orc_check AND historico_descr_cod = 14
        ) AS total_adjudicado,
        (
            SELECT SUM(COALESCE(fact_valor, 1))
            FROM factura
            JOIN processo ON proces_check = fact_proces_check
            WHERE proces_orc_check = orcamento.orc_check AND proces_report_valores = 1
        ) AS total_faturado
    FROM orcamento
    WHERE orc_rubrica = :orcamentoItem AND orc_ano = :anoCorrente
    GROUP BY orc_check
    ORDER BY regime, descritivo";

$stmtOrc = $myConn->prepare($sqlOrcamento);
$stmtOrc->bindParam(':orcamentoItem', $orcamentoItem);
$stmtOrc->bindParam(':anoCorrente', $anoCorrente);
$stmtOrc->execute();
$orcamentoList = $stmtOrc->fetchAll(PDO::FETCH_ASSOC);

// Consulta de todos os processos ligados a qualquer orçamento do resultado
$orcIds = array_column($orcamentoList, 'orc_check');
$placeholders = implode(',', array_fill(0, count($orcIds), '?'));

$processos = [];

if (count($orcIds) > 0) {
    $placeholders = implode(',', array_fill(0, count($orcIds), '?'));

    $sqlProcessos = "
        SELECT
            proces_check,
            proces_orc_check,
            proces_linha_orc AS linha_orc,
            proces_linha_se AS linha_se,
            proces_padm AS padm,
            proced_regime AS regime,
            proces_nome AS designacao,
            (
                SELECT SUM(COALESCE(historico_valor, 1))
                FROM historico
                WHERE historico_proces_check = processo.proces_check AND historico_descr_cod = 3
            ) AS consulta,
            (
                SELECT SUM(COALESCE(historico_valor, 1))
                FROM historico
                WHERE historico_proces_check = processo.proces_check AND historico_descr_cod = 14
            ) AS adjudicado,
            (
                SELECT SUM(COALESCE(fact_valor, 1))
                FROM factura
                WHERE fact_proces_check = processo.proces_check
            ) AS faturado
        FROM processo
        INNER JOIN procedimento ON proced_cod = proces_proced_cod
        WHERE proces_orc_check IN ($placeholders)
        AND proces_report_valores = 1
        ORDER BY regime DESC, proces_nome";

    $stmtProc = $myConn->prepare($sqlProcessos);
    $stmtProc->execute($orcIds);
    $processos = $stmtProc->fetchAll(PDO::FETCH_ASSOC);
}


// Agrupar processos por orçamento
$mapP = [];
foreach ($processos as $proc) {
    $mapP[$proc['proces_orc_check']][] = $proc;
}

// Montar array final de retorno
foreach ($orcamentoList as &$orc) {
    $orc['processos'] = $mapP[$orc['orc_check']] ?? [];
}

// Enviar JSON compatível com DataTables
  echo json_encode(["data" => $orcamentoList]);