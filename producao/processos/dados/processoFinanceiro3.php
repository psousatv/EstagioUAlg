<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);
//$q = $_GET['q'];

//Plano de Pagamentos
$processoOrcamento = "SELECT
                      orc_ano AS 'Ano',
                      sum(if((orc_proces_check = orc_proces_check), round(orc_valor_previsto,2),0)) AS 'Acum',
                      sum(if((orc_ano = orc_ano AND orc_mes = 1),round(orc_valor_previsto,2),0)) AS 'Jan',
                      sum(if((orc_ano = orc_ano AND orc_mes = 2),round(orc_valor_previsto,2),0)) AS 'Fev',
                      sum(if((orc_ano = orc_ano AND orc_mes = 3),round(orc_valor_previsto,2),0)) AS 'Mar',
                      sum(if((orc_ano = orc_ano AND orc_mes = 4),round(orc_valor_previsto,2),0)) AS 'Abr',
                      sum(if((orc_ano = orc_ano AND orc_mes = 5),round(orc_valor_previsto,2),0)) AS 'Mai',
                      sum(if((orc_ano = orc_ano AND orc_mes = 6),round(orc_valor_previsto,2),0)) AS 'Jun',
                      sum(if((orc_ano = orc_ano AND orc_mes = 7),round(orc_valor_previsto,2),0)) AS 'Jul',
                      sum(if((orc_ano = orc_ano AND orc_mes = 8),round(orc_valor_previsto,2),0)) AS 'Ago',
                      sum(if((orc_ano = orc_ano AND orc_mes = 9),round(orc_valor_previsto,2),0)) AS 'Set',
                      sum(if((orc_ano = orc_ano AND orc_mes = 10),round(orc_valor_previsto,2),0)) AS 'Out',
                      sum(if((orc_ano = orc_ano AND orc_mes = 11),round(orc_valor_previsto,2),0)) AS 'Nov',
                      sum(if((orc_ano = orc_ano AND orc_mes = 12),round(orc_valor_previsto,2),0)) AS 'Dez'
                      FROM orcamento
                      WHERE orc_proces_check = '" .$codigoProcesso. "'
                      GROUP BY orc_ano
                      ORDER BY orc_ano, orc_mes" ;

$stmt = $myConn->query($processoOrcamento);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

//Orçamento
echo "
<b>Orçamento</b>
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
foreach($data as $row){
  echo "
  <tr>
    <td style='text-align:center'>" .$row['Ano']. "</td>
    <td style='text-align: right'>" .number_format($row['Acum'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($row['Jan'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($row['Fev'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($row['Mar'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($row['Abr'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($row['Mai'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($row['Jun'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($row['Jul'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($row['Ago'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($row['Set'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($row['Out'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($row['Nov'], 2, ',', '.'). "</td>
    <td style='text-align: right'>" .number_format($row['Dez'], 2, ',', '.'). "</td>
    </tr>";
  };
echo "</table>";