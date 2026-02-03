<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);
$auto = intval($_GET['auto']);

//Mapa de Trabalhos - Auto n.º
$mapaAutos = "SELECT
                mt_linha AS ordem,
                mt_conta AS tipo_conta,
                mt_item AS item,
                mt_designacao AS designacao,
                mt_indexador AS indexador,
                mt_qt AS quantidade_proposto,
                mt_pu_obra AS preco_unitario_proposto,
                mt_val_obra AS valor_proposto,
                (SELECT auto_qt FROM obra_autos WHERE auto_indexador = mt_indexador AND auto_num = '" .$auto. "') AS quantidade_executado,
                (SELECT auto_punit FROM obra_autos WHERE auto_indexador = mt_indexador AND auto_num = '" .$auto. "') AS preco_unitario_executado,
                (SELECT auto_valor FROM obra_autos WHERE auto_indexador = mt_indexador AND auto_num = '" .$auto. "') AS valor_executado
                FROM mapa_trabalhos
                WHERE mt_check = '" .$codigoProcesso. "'
                ORDER BY ordem" ;

$stmt = $myConn->query($mapaAutos);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$valorAutos = array_sum(array_column($data, "valor_executado"));

//Mapa Trabalhos
echo "
<table class='table table-hover small'>
<tr style='text-align: center'>
  <colgroup>
    <col span='4'>
    <col span='3' style='background-color: #D6EEEE'>
    <col span='2' style='background-color: pink'>
  </colgroup>
  <tr style='text-align: center'>
    <th colspan='4' style='text-align: left'>
      <mark class='bg-warning'>
        <b>Valor do Auto n.º ".$auto." » ".number_format($valorAutos, 2, ",", ".")."€</b>
      </mark>
    </th>
    <th colspan='3'>Proposto</th>
    <th colspan='2'>Executado</th>
  </tr> 
  <tr style='text-align: center'>
    <td>Ordem</td>
    <td>Conta</td>
    <td>Item</td>
    <td>Designação</td>
    <td>Qt</td>
    <td>PUnit</td>
    <td>Valor</td>
    <td>Qt</td>
    <!--td>PUnit</td-->
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
      <td colspan='10' style='text-align:left'>" .$row['designacao']. "</td>
    </tr>";
    } elseif ($row['tipo_conta'] == 'T'){
    echo "
    <tr class='bg-info text-white'>
      <td style='text-align:left'>" .$row['ordem']. "</td>
      <td style='text-align:left'>" .$row['tipo_conta']. "</td>
      <td style='text-align:left'>" .$row['item']. "</td>
      <td colspan='10' style='text-align:left'>" .$row['designacao']. "</td>
    </tr>";
    } elseif ($row['tipo_conta'] == 'I'){
    echo "
      <tr class='bg-secondary text-white'>
        <td style='text-align:left'>" .$row['ordem']. "</td>
        <td style='text-align:left'>" .$row['tipo_conta']. "</td>
        <td style='text-align:left'>" .$row['item']. "</td>
        <td colspan='10' style='text-align:left'>" .$row['designacao']. "</td>
      </tr>";
    } else {
      echo "
        <tr>
          <td style='text-align:left'>" .$row['ordem']. "</td>
          <td style='text-align:left'>" .$row['tipo_conta']. "</td>
          <td style='text-align:left'>" .$row['item']. "</td>
          <td style='text-align:left'>" .$row['designacao']. "</td>
          <td style='text-align:right'>" .number_format($row['quantidade_proposto'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['preco_unitario_proposto'], 2, ',', '.'). "€</td>
          <td style='text-align:right'>" .number_format($row['valor_proposto'], 2, ',', '.'). "€</td>
          <td style='text-align:right'>" .number_format($row['quantidade_executado'], 2, ',', '.'). "</td>
          <!--td style='text-align:right'>" .number_format($row['preco_unitario_executado'], 2, ',', '.'). "€</td-->
          <td style='text-align:right'>" .number_format($row['valor_executado'], 2, ',', '.'). "€</td>
          
          ";
      };
  };
echo "</table>";