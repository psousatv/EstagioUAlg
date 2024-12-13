<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);

//Plano de Pagamentos
$processoPlanoPagamentosPrevisto = "SELECT
                      pp_ano AS 'Ano',
                      sum(if((pp_proces_check = pp_proces_check), round(pp_valor_previsto,2),0)) AS 'Acumulado',
                      sum(if((pp_ano = pp_ano AND pp_mes_previsto = 1),round(pp_valor_previsto,2),0)) AS 'Jan',
                      sum(if((pp_ano = pp_ano AND pp_mes_previsto = 2),round(pp_valor_previsto,2),0)) AS 'Fev',
                      sum(if((pp_ano = pp_ano AND pp_mes_previsto = 3),round(pp_valor_previsto,2),0)) AS 'Mar',
                      sum(if((pp_ano = pp_ano AND pp_mes_previsto = 4),round(pp_valor_previsto,2),0)) AS 'Abr',
                      sum(if((pp_ano = pp_ano AND pp_mes_previsto = 5),round(pp_valor_previsto,2),0)) AS 'Mai',
                      sum(if((pp_ano = pp_ano AND pp_mes_previsto = 6),round(pp_valor_previsto,2),0)) AS 'Jun',
                      sum(if((pp_ano = pp_ano AND pp_mes_previsto = 7),round(pp_valor_previsto,2),0)) AS 'Jul',
                      sum(if((pp_ano = pp_ano AND pp_mes_previsto = 8),round(pp_valor_previsto,2),0)) AS 'Ago',
                      sum(if((pp_ano = pp_ano AND pp_mes_previsto = 9),round(pp_valor_previsto,2),0)) AS 'Set',
                      sum(if((pp_ano = pp_ano AND pp_mes_previsto = 10),round(pp_valor_previsto,2),0)) AS 'Out',
                      sum(if((pp_ano = pp_ano AND pp_mes_previsto = 11),round(pp_valor_previsto,2),0)) AS 'Nov',
                      sum(if((pp_ano = pp_ano AND pp_mes_previsto = 12),round(pp_valor_previsto,2),0)) AS 'Dez'
                      FROM plano_pagamentos
                      WHERE pp_proces_check = '" .$codigoProcesso. "'
                      GROUP BY pp_ano
                      ORDER BY pp_ano, pp_auto_num" ;

$stmt = $myConn->query($processoPlanoPagamentosPrevisto);
$previsao = $stmt->fetchAll(PDO::FETCH_ASSOC);

//Realização
$processoPlanoPagamentosRealizado = "SELECT
                      pp_ano AS 'Ano',
                      sum(if((pp_proces_check = pp_proces_check), round(pp_valor_faturado,2),0)) AS 'Acumulado',
                      sum(if((pp_ano = pp_ano AND pp_mes_realizado = 1),round(pp_valor_faturado,2),0)) AS 'Jan',
                      sum(if((pp_ano = pp_ano AND pp_mes_realizado = 2),round(pp_valor_faturado,2),0)) AS 'Fev',
                      sum(if((pp_ano = pp_ano AND pp_mes_realizado = 3),round(pp_valor_faturado,2),0)) AS 'Mar',
                      sum(if((pp_ano = pp_ano AND pp_mes_realizado = 4),round(pp_valor_faturado,2),0)) AS 'Abr',
                      sum(if((pp_ano = pp_ano AND pp_mes_realizado = 5),round(pp_valor_faturado,2),0)) AS 'Mai',
                      sum(if((pp_ano = pp_ano AND pp_mes_realizado = 6),round(pp_valor_faturado,2),0)) AS 'Jun',
                      sum(if((pp_ano = pp_ano AND pp_mes_realizado = 7),round(pp_valor_faturado,2),0)) AS 'Jul',
                      sum(if((pp_ano = pp_ano AND pp_mes_realizado = 8),round(pp_valor_faturado,2),0)) AS 'Ago',
                      sum(if((pp_ano = pp_ano AND pp_mes_realizado = 9),round(pp_valor_faturado,2),0)) AS 'Set',
                      sum(if((pp_ano = pp_ano AND pp_mes_realizado = 10),round(pp_valor_faturado,2),0)) AS 'Out',
                      sum(if((pp_ano = pp_ano AND pp_mes_realizado = 11),round(pp_valor_faturado,2),0)) AS 'Nov',
                      sum(if((pp_ano = pp_ano AND pp_mes_realizado = 12),round(pp_valor_faturado,2),0)) AS 'Dez'
                      FROM plano_pagamentos
                      WHERE pp_valor_faturado > 0  AND pp_proces_check = '" .$codigoProcesso. "'
                      GROUP BY pp_ano
                      ORDER BY pp_ano, pp_auto_realizado" ;

$stmt = $myConn->query($processoPlanoPagamentosRealizado);
$realizacao = $stmt->fetchAll(PDO::FETCH_ASSOC);

$processoPrevistoAcumulado = array_sum(array_column($previsao, "Acumulado"));
$processoRealizadoAcumulado = array_sum(array_column($realizacao, "Acumulado"));

//Plano de Pagamentos Previsto
echo "
<b>Plano de Pagamentos » ".number_format($processoPrevistoAcumulado, 2, ",", ".")."€</b>
<table class='table table-bordered table-striped table-hover small'>
  <tr style='text-align: center'>
    <th>Ano</th>
    <th>Acumulado</th>
    <th>Jan</th>
    <th>Fev</th>
    <th>Mar</th>
    <th>Abr</th>
    <th>Mai</th>
    <th>Jun</th>
    <th>Jul</th>
    <th>Ago</th>
    <th>Set</th>
    <th>Out</th>
    <th>Nov</th>
    <th>Dez</th>
  </tr>";
foreach($previsao as $previsto){
  echo "
  <tr>
    <td style='text-align:center'>" .$previsto['Ano']. "</td>
    <td style='text-align: right'>" .number_format($previsto['Acumulado'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($previsto['Jan'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($previsto['Fev'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($previsto['Mar'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($previsto['Abr'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($previsto['Mai'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($previsto['Jun'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($previsto['Jul'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($previsto['Ago'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($previsto['Set'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($previsto['Out'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($previsto['Nov'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($previsto['Dez'], 2, ',', '.'). "</td>
    </tr>";
  };
echo "</table>";

//Plano de Pagamentos Realizado
echo "
<b>Realizado » ".number_format($processoRealizadoAcumulado, 2, ",", ".")."€</b>
<table class='table table-bordered table-striped table-hover small'>
  <tr style='text-align: center'>
    <th>Ano</th>
    <th>Acumulado</th>
    <th>Jan</th>
    <th>Fev</th>
    <th>Mar</th>
    <th>Abr</th>
    <th>Mai</th>
    <th>Jun</th>
    <th>Jul</th>
    <th>Ago</th>
    <th>Set</th>
    <th>Out</th>
    <th>Nov</th>
    <th>Dez</th>
  </tr>";
foreach($realizacao as $realizado){
  echo "
  <tr>
    <td style='text-align:center'>" .$realizado['Ano']. "</td>
    <td style='text-align: right'>" .number_format($realizado['Acumulado'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($realizado['Jan'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($realizado['Fev'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($realizado['Mar'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($realizado['Abr'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($realizado['Mai'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($realizado['Jun'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($realizado['Jul'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($realizado['Ago'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($realizado['Set'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($realizado['Out'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($realizado['Nov'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($realizado['Dez'], 2, ',', '.'). "</td>
    </tr>";
  };
echo "</table>";