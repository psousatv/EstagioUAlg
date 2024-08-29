<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);
//$q = $_GET['q'];

//Histórico Processos
$processoFaturas = "SELECT *
                    FROM factura
                    WHERE fact_proces_check = '" .$codigoProcesso. "'
                    ORDER BY fact_auto_num DESC" ;

$stmt = $myConn->query($processoFaturas);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

//Faturação
echo "
<b>Faturas</b>
<table class='table table-bordered table-striped table-hover small'>
  <tr style='text-align: center'>
    <th>Expediente</th>
    <th>Fatura</th>
    <th>Data</th>
    <th>Auto</th>
    <th>Data</th>
    <th>Valor</th>
    <th>Retenção</th>
    <th>Devoluções</th>
    <th>Retido</th>
    <th>Garantia</th>
    <th>Reduções</th>
    <th>Cativo</th>
  </tr>
    ";
foreach($data as $row)
{
  echo "<tr>";
  echo "<td style='text-align:left'>".$row['fact_expediente']."</td>";
  echo "<td style='text-align:left'>".$row['fact_tipo'].'_'.$row['fact_num']."</td>";
  echo "<td style='text-align:right'>".$row['fact_data']."</td>";
  echo "<td style='text-align:right'>".$row['fact_auto_num']."</td>";
  echo "<td style='text-align:right'>".$row['fact_auto_data']."</td>";
  echo "<td style='text-align:right'>" .number_format($row['fact_valor'], 2, ',', '.'). "</td>";
  echo "<td style='text-align:right'>" .number_format($row['fact_duovalor'], 2, ',', '.'). "</td>";
  echo "<td style='text-align:right'>" .number_format($row['fact_duopaga'], 2, ',', '.'). "</td>";
  echo "<td style='text-align:right'>" .number_format($row['fact_duovalor']-$row['fact_duopaga'], 2, ',', '.'). "</td>";
  echo "<td style='text-align:right'>" .number_format($row['fact_garban'], 2, ',', '.'). "</td>";
  echo "<td style='text-align:right'>" .number_format($row['fact_garbanpaga'], 2, ',', '.'). "</td>";
  echo "<td style='text-align:right'>" .number_format($row['fact_garban']-$row['fact_garbanpaga'], 2, ',', '.'). "</td>";
  echo "</tr>";
}
echo "</table>";