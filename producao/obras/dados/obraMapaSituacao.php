<?php
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);

$sql = "SELECT
            mt_linha AS ordem,
            mt_conta AS tipo_conta,
            mt_item AS item,
            mt_designacao AS designacao,
            mt_indexador AS indexador,
            mt_qt AS quantidade_proposto,
            mt_pu_obra AS preco_unitario_proposto,
            mt_val_obra AS valor_proposto,
            SUM(CASE WHEN mt_indexador = auto_indexador AND auto_num < 90 THEN auto_qt ELSE 0 END) AS quantidade_executado,
            SUM(CASE WHEN mt_indexador = auto_indexador AND auto_num < 90 THEN auto_valor ELSE 0 END) AS valor_executado
        FROM mapa_trabalhos
        LEFT JOIN obra_autos ON auto_indexador = mt_indexador
        WHERE mt_check = :codigo
        GROUP BY mt_item, mt_indexador
        ORDER BY ordem";

$stmt = $myConn->prepare($sql);
$stmt->execute(['codigo' => $codigoProcesso]);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$valorAutos = array_sum(array_column($data, "valor_executado"));

function f($valor, $euro = false){
    if ($valor == 0) return "<span class='zero'>0</span>";
    $formatado = number_format($valor, 2, ',', '.');
    return $euro ? $formatado."€" : $formatado;
}

function td($valor, $class='text-right'){
    return "<td class='$class'>$valor</td>";
}

$cores = [
    'R' => 'bg-primary text-white',
    'T' => 'bg-info text-white',
    'I' => 'bg-secondary text-white'
];

echo "
<div class='table-container'>
  <table class='table table-hover small'>
  <thead>
  <tr class='text-center'>
      <th colspan='4' class='head-1 text-left'>
          <b>Mapa de Situação » ".number_format($valorAutos,2,",",".")."€</b>
      </th>
      <th colspan='3'>Proposto</th>
      <th colspan='2'>Executado</th>
      <th colspan='3'>Não Executado</th>
  </tr>
  <tr class='head-2 text-center'>
      <th>Ordem</th>
      <th>Conta</th>
      <th>Item</th>
      <th>Designação</th>
      <th>Qt</th>
      <th>PUnit</th>
      <th>Valor</th>
      <th>Qt</th>
      <th>Valor</th>
      <th>Qt</th>
      <th>Valor</th>
      <th>%</th>
  </tr>
  </thead>
  <tbody>";

foreach($data as $row){

    if(isset($cores[$row['tipo_conta']])){
        echo "<tr class='{$cores[$row['tipo_conta']]}'>
                <td class='text-left'>{$row['ordem']}</td>
                <td class='text-left'>{$row['tipo_conta']}</td>
                <td class='text-left'>{$row['item']}</td>
                <td colspan='9' class='text-left'>{$row['designacao']}</td>
              </tr>";
        continue;
    }

    $qt_prop = $row['quantidade_proposto'];
    $val_prop = $row['valor_proposto'];
    $qt_exec = $row['quantidade_executado'];
    $val_exec = $row['valor_executado'];

    $qt_nao = $qt_prop - $qt_exec;
    $val_nao = $val_prop - $val_exec;
    $percent = $val_prop > 0 ? (1 - ($val_exec / $val_prop)) * 100 : 0;

    echo "<tr>";
    echo td($row['ordem'],'text-left');
    echo td($row['tipo_conta'],'text-left');
    echo td($row['item'],'text-left');
    echo td($row['designacao'],'text-left');

    echo td(f($qt_prop));
    echo td(f($row['preco_unitario_proposto'],true));
    echo td(f($val_prop,true));
    echo td(f($qt_exec));
    echo td(f($val_exec,true));
    echo td(f($qt_nao));
    echo td(f($val_nao,true));
    echo td(f($percent)."%");

    echo "</tr>";
}

echo "</tbody></table><div>";
?>