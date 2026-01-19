<?php
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);
$meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

/**
 * Função para gerar query pivot dinâmica
 */
function gerarPivotQuery($tabela, $colData, $colValor, $codigoProcesso, $colProcessoCheck) {
    global $meses;
    $sql = "SELECT YEAR($colData) AS Ano, 
                   SUM($colValor) AS Acumulado";

    foreach(range(1,12) as $m) {
        $sql .= ", SUM(IF(MONTH($colData) = $m, $colValor, 0)) AS `" . $meses[$m-1] . "`";
    }

    $sql .= " FROM $tabela 
              WHERE $colProcessoCheck = $codigoProcesso
              GROUP BY YEAR($colData)
              ORDER BY YEAR($colData)";
    return $sql;
}

/**
 * Função para gerar tabela HTML dinâmica
 */
function gerarTabelaHTML($dados, $titulo) {
    global $meses;
    $acumuladoTotal = array_sum(array_column($dados,'Acumulado'));

    $html = "<b>$titulo » ".number_format($acumuladoTotal,2,',','.')."€</b>
             <table class='table table-bordered table-striped table-hover small'>
             <tr style='text-align: center'>
                <th>Ano</th>
                <th>Acumulado</th>";

    foreach($meses as $mes) $html .= "<th>$mes</th>";
    $html .= "</tr>";

    foreach($dados as $row){
        $html .= "<tr>
                    <td style='text-align:center'>{$row['Ano']}</td>
                    <td style='text-align:right'>".number_format($row['Acumulado'],2,',','.')."</td>";
        foreach($meses as $mes){
            $html .= "<td style='text-align:right'>".number_format($row[$mes],2,',','.')."</td>";
        }
        $html .= "</tr>";
    }

    $html .= "</table>";
    return $html;
}

// Consulta Plano de Pagamentos Previsto
$sqlPrevisto = gerarPivotQuery(
    'plano_pagamentos',
    "STR_TO_DATE(CONCAT('10/',LPAD(pp_mes_previsto,2,'0'),'/',pp_ano), '%d/%m/%Y')",
    'pp_valor_previsto',
    $codigoProcesso,
    'pp_proces_check'
);
$previsao = $myConn->query($sqlPrevisto)->fetchAll(PDO::FETCH_ASSOC);
echo gerarTabelaHTML($previsao,"Previsto");

// Consulta Realizado
$sqlRealizado = gerarPivotQuery('factura','fact_auto_data','fact_valor',$codigoProcesso,'fact_proces_check');
$realizado = $myConn->query($sqlRealizado)->fetchAll(PDO::FETCH_ASSOC);
echo gerarTabelaHTML($realizado,"Realizado");
