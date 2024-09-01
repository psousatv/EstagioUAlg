<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);
//$q = $_GET['q'];

//Mapa de Trabalhos
$mapaTrabalhos = "SELECT
                    mt_linha AS ordem,
                    mt_conta AS tipo_conta,
                    mt_item_papel AS item,
                    mt_designacao AS designacao,
                    mt_un AS unidades,
                    mt_qt AS quantidade,
                    mt_pu_orcamento AS preco_unitario_orcamento,
                    mt_val_orcamento AS valor_orcamento,
                    mt_pu_obra AS preco_unitario_empreiteiro,
                    mt_val_obra AS valor_empreiteiro
                    FROM mapa_trabalhos
                    WHERE mt_check = '" .$codigoProcesso. "'
                    ORDER BY ordem ASC" ;

$stmt = $myConn->query($mapaTrabalhos);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

//Faturação
echo "
<b>Mapa de Trabalhos</b>
<table class='table table-responsive table-hover small'>
  <tr style='text-align: center'>
    <th>Ordem</th>
    <th>Conta</th>
    <th>Item</th>
    <th>Designação</th>
    <th>UN</th>
    <th>QT</th>
    <th>PU.Orc.</th>
    <th>Total</th>
    <th>PU.Ctr.</th>
    <th>Total</th>
    </tr>";
foreach($data as $row){
  if($row['tipo_conta'] === 'R'){
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
          <td style='text-align:left'>" .$row['unidades']. "</td>
          <td style='text-align:right'>" .number_format($row['quantidade'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['preco_unitario_orcamento'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['valor_orcamento'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['preco_unitario_empreiteiro'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['valor_empreiteiro'], 2, ',', '.'). "</td>
        </tr>";
      } 
  };
echo "</table>";