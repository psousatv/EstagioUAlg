<?php
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);
$meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function gerarPivotQuery($tabela, $colData, $colValor, $codigoProcesso, $colProcessoCheck) {
    global $meses;
    $sql = "SELECT YEAR($colData) AS Ano, SUM($colValor) AS Acumulado";

    foreach(range(1,12) as $m) {
        $sql .= ", SUM(IF(MONTH($colData) = $m, $colValor, 0)) AS `" . $meses[$m-1] . "`";
    }

    $sql .= " FROM $tabela 
              WHERE $colProcessoCheck = $codigoProcesso
              GROUP BY YEAR($colData)
              ORDER BY YEAR($colData)";
    return $sql;
}


// Previsão
$sqlPrevisto = gerarPivotQuery(
    'plano_pagamentos',
    "STR_TO_DATE(CONCAT('10/',LPAD(pp_mes_previsto,2,'0'),'/',pp_ano), '%d/%m/%Y')",
    'pp_valor_previsto',
    $codigoProcesso,
    'pp_proces_check'
);
$previsao = $myConn->query($sqlPrevisto)->fetchAll(PDO::FETCH_ASSOC);

// Realizado
$sqlRealizado = gerarPivotQuery(
    'factura',
    'fact_auto_data',
    'fact_valor',
    $codigoProcesso,
    'fact_proces_check'
);
$realizado = $myConn->query($sqlRealizado)->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'previsto' => $previsao,
    'realizado' => $realizado
]);
