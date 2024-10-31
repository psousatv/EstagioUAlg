<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);
//$q = $_GET['q'];

//Histórico Processos
$processoFaturacao = "SELECT
                    year(fact_auto_data) AS 'Ano',
                    sum(if((fact_proces_check = fact_proces_check), round(fact_valor,2),0)) AS 'Acum',
                    sum(if((month(fact_auto_data) = 1),round(fact_valor,2),0)) AS 'Jan',
                    sum(if((month(fact_auto_data) = 2),round(fact_valor,2),0)) AS 'Fev',
                    sum(if((month(fact_auto_data) = 3),round(fact_valor,2),0)) AS 'Mar',
                    sum(if((month(fact_auto_data) = 4),round(fact_valor,2),0)) AS 'Abr',
                    sum(if((month(fact_auto_data) = 5),round(fact_valor,2),0)) AS 'Mai',
                    sum(if((month(fact_auto_data) = 6),round(fact_valor,2),0)) AS 'Jun',
                    sum(if((month(fact_auto_data) = 7),round(fact_valor,2),0)) AS 'Jul',
                    sum(if((month(fact_auto_data) = 8),round(fact_valor,2),0)) AS 'Ago',
                    sum(if((month(fact_auto_data) = 9),round(fact_valor,2),0)) AS 'Set',
                    sum(if((month(fact_auto_data) = 10),round(fact_valor,2),0)) AS 'Out',
                    sum(if((month(fact_auto_data) = 11),round(fact_valor,2),0)) AS 'Nov',
                    sum(if((month(fact_auto_data) = 12),round(fact_valor,2),0)) AS 'Dez'
                    FROM factura
                    WHERE fact_proces_check = '" .$codigoProcesso. "'
                    GROUP BY year(fact_auto_data)
                    ORDER BY fact_auto_num ASC" ;

$stmt = $myConn->query($processoFaturacao);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$processoFaturacaoAcumulado = array_sum(array_column($data, "Acum"));

//Faturação
echo "
<b>Faturação » ".number_format($processoFaturacaoAcumulado, 2, ",", ".")."€</b>
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
      <td style='text-align:right'>" .number_format($row['Acum'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['Jan'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['Fev'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['Mar'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['Abr'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['Mai'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['Jun'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['Jul'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['Ago'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['Set'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['Out'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['Nov'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['Dez'], 2, ',', '.'). "</td>
    </tr>";
  };
echo "</table>";

echo "<a class='hidden'>";
json_encode($data);
echo "</a>";