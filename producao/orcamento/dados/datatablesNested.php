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
        orc_check AS controle,
        orc_tipo AS tipo,
        orc_linha AS linhaO,
        orc_linha_SE AS linhaSE,
        orc_descritivo AS descritivo,
        orc_valor_previsto AS previsto,
        SUM(orc_valor_previsto) AS total_previsto,
        (
            SELECT SUM(COALESCE(historico_valor, 0))
            FROM historico
            LEFT JOIN processo ON proces_check = historico_proces_check
            WHERE proces_orcamento = orcamento.orc_check AND historico_descr_cod = 14
        ) AS total_adjudicado,
        (
            SELECT SUM(COALESCE(fact_valor, 0))
            FROM factura
            LEFT JOIN processo ON proces_check = fact_proces_check
            WHERE proces_orcamento = orcamento.orc_check AND proces_report_valores = 1
        ) AS total_faturado
    FROM orcamento
    WHERE orc_rub_cod = :orcamentoItem AND orc_ano = :anoCorrente
    GROUP BY orc_linha
    ORDER BY orc_linha
";
$stmtOrc = $myConn->prepare($sqlOrcamento);
$stmtOrc->bindParam(':orcamentoItem', $orcamentoItem);
$stmtOrc->bindParam(':anoCorrente', $anoCorrente);
$stmtOrc->execute();
$orcamentoList = $stmtOrc->fetchAll(PDO::FETCH_ASSOC);

// Consulta de todos os processos ligados a qualquer orçamento do resultado
$orcIds = array_column($orcamentoList, 'controle');
$placeholders = implode(',', array_fill(0, count($orcIds), '?'));

$processos = [];

if (count($orcIds) > 0) {
    $placeholders = implode(',', array_fill(0, count($orcIds), '?'));

    $sqlProcessos = "
        SELECT
            proces_check,
            proces_orcamento,
            proces_padm AS padm,
            proced_sigla AS procedimento,
            proces_nome AS designacao,
            (
                SELECT SUM(COALESCE(historico_valor, 0))
                FROM historico
                WHERE historico_proces_check = processo.proces_check AND historico_descr_cod = 3
            ) AS consulta,
            (
                SELECT SUM(COALESCE(historico_valor, 0))
                FROM historico
                WHERE historico_proces_check = processo.proces_check AND historico_descr_cod = 14
            ) AS adjudicado,
            (
                SELECT SUM(COALESCE(fact_valor, 0))
                FROM factura
                WHERE fact_proces_check = processo.proces_check
            ) AS faturado
        FROM processo
        INNER JOIN procedimento ON proced_cod = proces_proced_cod
        WHERE proces_orcamento IN ($placeholders)
        AND proces_report_valores = 1
        ORDER BY proces_nome
    ";
    $stmtProc = $myConn->prepare($sqlProcessos);
    $stmtProc->execute($orcIds);
    $processos = $stmtProc->fetchAll(PDO::FETCH_ASSOC);
}


// Agrupar processos por orçamento
$mapP = [];
foreach ($processos as $proc) {
    $mapP[$proc['proces_orcamento']][] = $proc;
}

// Montar array final de retorno
foreach ($orcamentoList as &$orc) {
    $orc['processos'] = $mapP[$orc['controle']] ?? [];
}

// Enviar JSON compatível com DataTables
  echo json_encode(["data" => $orcamentoList]);