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
                    mt_pu_obra AS pu,
                    mt_val_obra AS valor,
                    auto_num,
                    SUM(CASE WHEN auto_num = auto_num THEN auto_qt ELSE 0 END) AS qt,
                    SUM(CASE WHEN auto_num = auto_num THEN auto_valor ELSE 0 END) AS total,
                    CASE WHEN auto_num = auto_num THEN auto_obs ELSE NULL END AS obs
                    FROM obra_autos
                    INNER JOIN mapa_trabalhos ON mt_check = auto_check 
                    WHERE mt_check = '" .$codigoProcesso. "'
                    GROUP BY ordem, tipo_conta, item, designacao, unidades, quantidade, pu, valor, auto_num
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
    <th>PUnit</th>
    <th>Total</th>
    <th>Qt</th>
    <th>Total</th>
    <th>Obs</th>
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
          <td style='text-align:right'>" .number_format($row['pu'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['valor'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['qt'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['total'], 2, ',', '.'). "</td>
          <td style='text-align:left'>" .$row['obs']. "</td>
        </tr>";
      } 
  };
echo "</table>";