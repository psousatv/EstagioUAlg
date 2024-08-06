<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);
//$q = $_GET['q'];

//Plano de Pagamentos
$processoOrcamento = "SELECT
                      pp_ano AS 'Ano',
                      sum(if((pp_proces_check = pp_proces_check), round(pp_valor,2),0)) AS 'Acum',
                      sum(if((pp_ano = pp_ano AND pp_mes = 1),round(pp_valor,2),0)) AS 'Jan',
                      sum(if((pp_ano = pp_ano AND pp_mes = 2),round(pp_valor,2),0)) AS 'Fev',
                      sum(if((pp_ano = pp_ano AND pp_mes = 3),round(pp_valor,2),0)) AS 'Mar',
                      sum(if((pp_ano = pp_ano AND pp_mes = 4),round(pp_valor,2),0)) AS 'Abr',
                      sum(if((pp_ano = pp_ano AND pp_mes = 5),round(pp_valor,2),0)) AS 'Mai',
                      sum(if((pp_ano = pp_ano AND pp_mes = 6),round(pp_valor,2),0)) AS 'Jun',
                      sum(if((pp_ano = pp_ano AND pp_mes = 7),round(pp_valor,2),0)) AS 'Jul',
                      sum(if((pp_ano = pp_ano AND pp_mes = 8),round(pp_valor,2),0)) AS 'Ago',
                      sum(if((pp_ano = pp_ano AND pp_mes = 9),round(pp_valor,2),0)) AS 'Set',
                      sum(if((pp_ano = pp_ano AND pp_mes = 10),round(pp_valor,2),0)) AS 'Out',
                      sum(if((pp_ano = pp_ano AND pp_mes = 11),round(pp_valor,2),0)) AS 'Nov',
                      sum(if((pp_ano = pp_ano AND pp_mes = 12),round(pp_valor,2),0)) AS 'Dez'
                      FROM plano_pagamento
                      WHERE pp_proces_check = '" .$codigoProcesso. "'
                      GROUP BY pp_ano
                      ORDER BY pp_ano, pp_auto_num" ;

$stmt = $myConn->query($processoOrcamento);
$resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);



//Plano de Pagamentos
echo "
<b>Plano de Pagamentos</b>
<table class='table table-responsive table-bordered table-striped table-hover small'>
  <tr style='text-align: center'>
    <th>Ano</th>
    <th>Acum</th>
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
foreach($resultado as $row)
{
  echo "
  <tr>
    <td style='text-align:center'>" .$row['Ano']. "</td>
    <td style='text-align:right; width: 100px'>" .number_format($row['Acum'], 2, ',', '.'). "</td>
    <td style='text-align:right; width: 100px'>" .number_format($row['Jan'], 2, ',', '.'). "</td>
    <td style='text-align:right; width: 100px'>" .number_format($row['Fev'], 2, ',', '.'). "</td>
    <td style='text-align:right; width: 100px'>" .number_format($row['Mar'], 2, ',', '.'). "</td>
    <td style='text-align:right; width: 100px'>" .number_format($row['Abr'], 2, ',', '.'). "</td>
    <td style='text-align:right; width: 100px'>" .number_format($row['Mai'], 2, ',', '.'). "</td>
    <td style='text-align:right; width: 100px'>" .number_format($row['Jun'], 2, ',', '.'). "</td>
    <td style='text-align:right; width: 100px'>" .number_format($row['Jul'], 2, ',', '.'). "</td>
    <td style='text-align:right; width: 100px'>" .number_format($row['Ago'], 2, ',', '.'). "</td>
    <td style='text-align:right; width: 100px'>" .number_format($row['Set'], 2, ',', '.'). "</td>
    <td style='text-align:right; width: 100px'>" .number_format($row['Out'], 2, ',', '.'). "</td>
    <td style='text-align:right; width: 100px'>" .number_format($row['Nov'], 2, ',', '.'). "</td>
    <td style='text-align:right; width: 100px'>" .number_format($row['Dez'], 2, ',', '.'). "</td>
    </tr>";
};
echo "</table>";