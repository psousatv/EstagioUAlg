<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);
//$q = $_GET['q'];

//Mapa de Trabalhos
$mapaAutos = "SELECT
                mt_linha AS ordem,
                mt_conta AS tipo_conta,
                mt_item AS item,
                mt_designacao AS designacao,
                mt_indexador AS indexador,
                CASE WHEN auto_indexador = mt_indexador THEN mt_qt ELSE 0 END AS quantidade_proposto,
                CASE WHEN auto_indexador = mt_indexador THEN mt_pu_obra ELSE 0 END AS preco_unitario_proposto,
                CASE WHEN auto_indexador = mt_indexador THEN mt_val_obra ELSE 0 END AS valor_proposto,
                SUM(CASE WHEN auto_indexador = mt_indexador THEN auto_qt ELSE 0 END) AS quantidade_executado,
                CASE WHEN auto_indexador = mt_indexador THEN auto_punit ELSE 0 END AS preco_unitario_executado,
                SUM(CASE WHEN auto_indexador = mt_indexador THEN auto_valor ELSE 0 END) AS valor_executado
                FROM mapa_trabalhos
                LEFT JOIN obra_autos ON auto_indexador = mt_indexador
                WHERE mt_check = '" .$codigoProcesso. "'
                GROUP BY mt_item, mt_indexador 
                ORDER BY ordem" ;

$stmt = $myConn->query($mapaAutos);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

//Mapa Trabalhos
echo "
<b>Mapa de Situação</b>
<table class='table table-responsive table-hover small'>
<tr style='text-align: center'>
  <colgroup>
    <col span='4'>  
    <col span='2' style='background-color: #D6EEEE'>
    <col span='3' style='background-color: pink'>
  </colgroup>
  <tr style='text-align: center'>
    <th>Ordem</th>
    <th>Conta</th>
    <th>Item</th>
    <th>Designação</th>
    <th colspan='2'>Proposto</th>
    <th colspan='3'>Executado</th>
    <th colspan='3'>Saldo</th>
  </tr> 
  <tr style='text-align: center'>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td>Qt</td>
    <td>PUnit</td>
    <td>Valor</td>
    <td>Qt</td>
    <td>PUnit</td>
    <td>Valor</td>
    <td>Qt</td>
    <td>Valor</td>
  </tr>
</tr>";
foreach($data as $row){
  if($row['tipo_conta'] == 'R'){
    echo "
    <tr class='bg-primary text-white'>
      <td style='text-align:left'>" .$row['ordem']. "</td>
      <td style='text-align:left'>" .$row['tipo_conta']. "</td>
      <td style='text-align:left'>" .$row['item']. "</td>
      <td style='text-align:left'>" .$row['designacao']. "</td>
      </tr>";
    } elseif ($row['tipo_conta'] == 'T'){
      echo "
        <tr class='bg-info text-white'>
          <td style='text-align:left'>" .$row['ordem']. "</td>
          <td style='text-align:left'>" .$row['tipo_conta']. "</td>
          <td style='text-align:left'>" .$row['item']. "</td>
          <td style='text-align:left'>" .$row['designacao']. "</td>
          </tr>";
    } elseif ($row['tipo_conta'] == 'I'){
      echo "
        <tr class='bg-secondary text-white'>
          <td style='text-align:left'>" .$row['ordem']. "</td>
          <td style='text-align:left'>" .$row['tipo_conta']. "</td>
          <td style='text-align:left'>" .$row['item']. "</td>
          <td style='text-align:left'>" .$row['designacao']. "</td>
          </tr>";
    } else {
      echo "
        <tr>
          <td style='text-align:left'>" .$row['ordem']. "</td>
          <td style='text-align:left'>" .$row['tipo_conta']. "</td>
          <td style='text-align:left'>" .$row['item']. "</td>
          <td style='text-align:left'>" .$row['designacao']. "</td>
          <td style='text-align:right'>" .number_format($row['quantidade_proposto'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['preco_unitario_proposto'], 3, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['valor_proposto'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['quantidade_executado'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['preco_unitario_executado'], 3, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['valor_executado'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format(($row['quantidade_proposto']-$row['quantidade_executado']), 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format(($row['valor_proposto']-$row['valor_executado']), 2, ',', '.'). "</td>
        </tr>";
      } 
  };
echo "</table>";