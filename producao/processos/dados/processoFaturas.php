<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);
//$q = $_GET['q'];

//Histórico Processos
$processoFaturas = "SELECT *
                    FROM factura
                    WHERE fact_proces_check = '" .$codigoProcesso. "'
                    ORDER BY fact_auto_num DESC";

$stmt = $myConn->query($processoFaturas);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$processoFaturasAcumulado = array_sum(array_column($data, "fact_valor"));

//Faturação
echo "
<b>Faturação » ".number_format($processoFaturasAcumulado, 2, ",", ".")."€</b>
<table class='table table-bordered table-striped table-hover small'>
<tr style='text-align: center'>
  <th class='bg-secondary text-white' colspan='6'>Faturas</th>
  <th colspan='3'>Duodécimos</th>
  <th class='bg-secondary text-white' colspan='3'>Garantia Bancária</th>
</tr>
  <tr style='text-align: center'>
    <th>Expediente</th>
    <th>Fatura</th>
    <th>Data</th>
    <th>Auto</th>
    <th>Data</th>
    <th class='bg-success'>Valor</th>
    <th>Duodécimo</th>
    <th>Devoluções</th>
    <th class='bg-warning'>Retido</th>
    <th>Garantia</th>
    <th>Reduções</th>
    <th class='bg-warning'>Cativo</th>
  </tr>";
foreach($data as $row)
{
  $tipo = substr($row['fact_expediente'], 0, 1);
  $numero = substr($row['fact_expediente'], 1, 5);
  $ano = substr($row['fact_expediente'], 6, 7);
  $expediente = $tipo. "." .$numero. "." .$ano;
  echo "
    <tr>
      <td style='text-align:left'>".$expediente."</td>
      <td style='text-align:left'>".$row['fact_tipo'].'_'.$row['fact_num']."</td>
      <td style='text-align:right'>".$row['fact_data']."</td>
      <td style='text-align:right'>".$row['fact_auto_num']."</td>
      <td style='text-align:right'>".$row['fact_auto_data']."</td>
      <td class='bg-success' style='text-align:right'>" .number_format($row['fact_valor'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['fact_duovalor'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['fact_duopaga'], 2, ',', '.'). "</td>
      <td class='bg-warning' style='text-align:right'>" .number_format($row['fact_duovalor']-$row['fact_duopaga'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['fact_garban'], 2, ',', '.'). "</td>
      <td style='text-align:right'>" .number_format($row['fact_garbanpaga'], 2, ',', '.'). "</td>
      <td class='bg-warning' style='text-align:right'>" .number_format($row['fact_garban']-$row['fact_garbanpaga'], 2, ',', '.'). "</td>
    </tr>";
};
echo "</table>";