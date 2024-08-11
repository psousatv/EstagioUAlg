<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);

//Histórico Processos
$processoHistorico = 'SELECT * FROM historico
                    WHERE historico_proces_check = "' .$codigoProcesso. '"
                    ORDER BY historico_dataemissao DESC' ;

$stmt = $myConn->query($processoHistorico);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);


echo '
<table class="table table-striped table-hover small">
  <tr style="text-align: center">
    <th>Data</th>
    <th>Aprovado</th>
    <th>Movimento</th>
    <th>Valor</th>
    <th>Documento</th>
    <th>Outro</th>
    <th>Observações</th>
  </tr>';

foreach($data as $row)
{
  echo '
    <tr>
      <td>'.$row["historico_dataemissao"].'</td>
      <td>' .$row["historico_datamov"].'</td>
      <td>' .$row["historico_descr_nome"].'</td>
      <td>'.number_format($row["historico_valor"], 2, ",", ".").'</td>
      <td>' .$row["historico_doc"].'</td>
      <td>' .$row["historico_num"].'</td>
      <td>' .$row["historico_obs"].'</td>
    </tr>
    ';
}

echo '
  </table>';

