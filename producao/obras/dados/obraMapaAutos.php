<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);
//$q = $_GET['q'];

//Mapa de Trabalhos
$mapaAutos = "SELECT
                mt_item AS item,
                mt_conta AS tipo_conta,
                mt_designacao AS designacao,
                mt_indexador AS indexador,
                auto_num,
                SUM(CASE WHEN auto_indexador = mt_indexador THEN auto_valor ELSE 0 END) AS total,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=1 THEN auto_valor ELSE 0 END) AS auto1,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=2 THEN auto_valor ELSE 0 END) AS auto2,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=3 THEN auto_valor ELSE 0 END) AS auto3,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=4 THEN auto_valor ELSE 0 END) AS auto4,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=5 THEN auto_valor ELSE 0 END) AS auto5,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=6 THEN auto_valor ELSE 0 END) AS auto6,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=7 THEN auto_valor ELSE 0 END) AS auto7,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=8 THEN auto_valor ELSE 0 END) AS auto8,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=9 THEN auto_valor ELSE 0 END) AS auto9,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=10 THEN auto_valor ELSE 0 END) AS auto10,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=11 THEN auto_valor ELSE 0 END) AS auto11,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=12 THEN auto_valor ELSE 0 END) AS auto12,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=13 THEN auto_valor ELSE 0 END) AS auto13,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=14 THEN auto_valor ELSE 0 END) AS auto14,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=15 THEN auto_valor ELSE 0 END) AS auto15,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=16 THEN auto_valor ELSE 0 END) AS auto16,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=17 THEN auto_valor ELSE 0 END) AS auto17,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=18 THEN auto_valor ELSE 0 END) AS auto18,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=19 THEN auto_valor ELSE 0 END) AS auto19,
                SUM(CASE WHEN auto_indexador = mt_indexador AND auto_num=20 THEN auto_valor ELSE 0 END) AS auto20
                FROM mapa_trabalhos
                INNER JOIN obra_autos ON mt_check = auto_check
                WHERE mt_check = '" .$codigoProcesso. "'
                GROUP BY mt_item, mt_indexador " ;

$stmt = $myConn->query($mapaAutos);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

//Mapa Trabalhos
echo "
<b>Mapa de Autos</b>
<table class='table table-responsive table-hover small'>
  <tr style='text-align: center'>
    <th>Conta</th>
    <th>Item</th>
    <th>Designação</th>
    <th>Acum</th>
    <th>1</th>
    <th>2</th>
    <th>3</th>
    <th>4</th>
    <th>5</th>
    <th>6</th>
    <th>7</th>
    <th>8</th>
    <th>9</th>
    <th>10</th>
    <th>11</th>
    <th>12</th>
    <th>13</th>
    <th>14</th>
    <th>15</th>
    </tr>";
foreach($data as $row){
  if($row['tipo_conta'] === 'R'){
    echo "
    <tr class='bg-primary text-white'>
      <td style='text-align:left'>" .$row['tipo_conta']. "</td>
      <td style='text-align:left'>" .$row['item']. "</td>
      <td style='text-align:left'>" .$row['designacao']. "</td>
      </tr>";
    } elseif ($row['tipo_conta'] == 'T'){
      echo "
        <tr class='bg-info text-white'>
          <td style='text-align:left'>" .$row['tipo_conta']. "</td>
          <td style='text-align:left'>" .$row['item']. "</td>
          <td style='text-align:left'>" .$row['designacao']. "</td>
          </tr>";
    } elseif ($row['tipo_conta'] == 'I'){
      echo "
        <tr class='bg-secondary text-white'>
          <td style='text-align:left'>" .$row['tipo_conta']. "</td>
          <td style='text-align:left'>" .$row['item']. "</td>
          <td style='text-align:left'>" .$row['designacao']. "</td>
          </tr>";
    } else {
      echo "
        <tr>
          <td style='text-align:left'>" .$row['tipo_conta']. "</td>
          <td style='text-align:left'>" .$row['item']. "</td>
          <td style='text-align:left'>" .$row['designacao']. "</td>
          <td style='text-align:right'>" .number_format($row['total'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['auto1'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['auto2'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['auto3'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['auto4'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['auto5'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['auto6'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['auto7'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['auto8'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['auto9'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['auto10'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['auto11'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['auto12'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['auto13'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['auto14'], 2, ',', '.'). "</td>
          <td style='text-align:right'>" .number_format($row['auto15'], 2, ',', '.'). "</td>
        </tr>";
      } 
  };
echo "</table>";