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
                    ORDER BY ordem ASC " ;

$stmt = $myConn->query($mapaTrabalhos);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$valorTrabalhos = array_sum(array_column($data, "valor_empreiteiro"));

//Mapa Trabalhos
echo "
<table class='table table-responsive table-hover small'>
  <colgroup>
    <col span='5'>  
    <col span='3' style='background-color: #D6EEEE'>
    <col span='2' style='background-color: pink'>
    <col span='3' style='background-color: #D6EEEE'>
  </colgroup>
  <thead>
    <tr style='text-align: center'>
      <th colspan='5' style='text-align: left'>
        <b>Mapa de Trabalhos » " . number_format($valorTrabalhos, 2, ",", ".") . "€</b>
      </th>
      <th colspan='3'>Orçamento</th>
      <th colspan='2'>Proposto</th>
      <th colspan='3'>Variação</th>
    </tr>
    <tr style='text-align: center'>
      <th>Ordem</th>
      <th>Conta</th>
      <th>Item</th>
      <th>Designação</th>
      <th>un</th>
      <th>Qt</th>
      <th>PUnit</th>
      <th>Valor</th>
      <th>PUnit</th>
      <th>Valor</th>
      <th colspan='2'>€</th>
      <th>%</th>
    </tr>
  </thead>
  <tbody>";

foreach ($data as $row) {
  if ($row['tipo_conta'] == 'R') {
    echo "
    <tr class='bg-primary text-white'>
      <td>" . $row['ordem'] . "</td>
      <td>" . $row['tipo_conta'] . "</td>
      <td>" . $row['item'] . "</td>
      <td colspan='10'>" . $row['designacao'] . "</td>
    </tr>";
  } elseif ($row['tipo_conta'] == 'T') {
    echo "
    <tr class='bg-info text-white'>
      <td>" . $row['ordem'] . "</td>
      <td>" . $row['tipo_conta'] . "</td>
      <td>" . $row['item'] . "</td>
      <td colspan='10'>" . $row['designacao'] . "</td>
    </tr>";
  } elseif ($row['tipo_conta'] == 'I') {
    echo "
    <tr class='bg-secondary text-white'>
      <td>" . $row['ordem'] . "</td>
      <td>" . $row['tipo_conta'] . "</td>
      <td>" . $row['item'] . "</td>
      <td colspan='10'>" . $row['designacao'] . "</td>
    </tr>";
  } elseif ($row['tipo_conta'] == 'M') {
    $variacaoUnit = $row['preco_unitario_empreiteiro'] - $row['preco_unitario_orcamento'];
    $variacaoValor = $row['valor_empreiteiro'] - $row['valor_orcamento'];
    $variacaoPerc = $row['valor_orcamento'] > 0 ? (($row['valor_empreiteiro'] / $row['valor_orcamento']) - 1) * 100 : 0;

    echo "
    <tr>
      <td>" . $row['ordem'] . "</td>
      <td>" . $row['tipo_conta'] . "</td>
      <td>" . $row['item'] . "</td>
      <td>" . $row['designacao'] . "</td>
      <td>" . $row['unidades'] . "</td>
      <td style='text-align:right'>" . number_format($row['quantidade'], 2, ',', '.') . "</td>
      <td style='text-align:right'>" . number_format($row['preco_unitario_orcamento'], 2, ',', '.') . "€</td>
      <td style='text-align:right'>" . number_format($row['valor_orcamento'], 2, ',', '.') . "€</td>
      <td style='text-align:right'>" . number_format($row['preco_unitario_empreiteiro'], 2, ',', '.') . "€</td>
      <td style='text-align:right'>" . number_format($row['valor_empreiteiro'], 2, ',', '.') . "€</td>
      <td style='text-align:right'>" . number_format($variacaoUnit, 2, ',', '.') . "€</td>
      <td style='text-align:right'>" . number_format($variacaoValor, 2, ',', '.') . "€</td>
      <td style='text-align:right'>" . number_format($variacaoPerc, 2, ',', '.') . "%</td>
    </tr>";
  } else {
    echo "
    <tr>
      <td>" . $row['ordem'] . "</td>
      <td>" . $row['tipo_conta'] . "</td>
      <td>" . $row['item'] . "</td>
      <td colspan='10'>" . $row['designacao'] . "</td>
    </tr>";
  }
}

echo "</tbody></table>";