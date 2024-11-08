<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);

//Histórico Processos
$processoHistorico = 'SELECT * 
                      FROM historico
                      WHERE historico_proces_check = "' .$codigoProcesso. '"
                      ORDER BY historico_dataemissao DESC' ;

$stmt = $myConn->query($processoHistorico);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);


echo '
<table class="table table-bordered table-striped table-hover small">
  <tr style="text-align: center">
    <th>Data</th>
    <th>Aprovado</th>
    <th>Assunto</th>
    <th>Documento</th>
    <th>Outro</th>
    <th>Observações</th>
    <!--th>Notas</th-->
    <th>Valor</th>
  </tr>';

foreach($data as $row)
{
// Se Garantias Bancárias - Evidencia
  if($row['historico_descr_cod'] == 21 OR $row['historico_descr_cod'] == 22){
    echo '
    <tr class="bg-warning">
      <td>'.$row["historico_dataemissao"].'</td>
      <td>'.$row["historico_datamov"].'</td>
      <td>'.$row["historico_descr_nome"].'</td>
      <td>'.$row["historico_doc"].'</td>
      <td>'.$row["historico_num"].'</td>
      <td>'.$row["historico_obs"].'</td>
      <!--td>'.$row["historico_notas"].'</td-->
      <td class="text-right">'.number_format($row["historico_valor"], 2, ",", ".").'</td>
    </tr>';} 
  elseif ($row['historico_descr_cod'] == 15 OR $row['historico_descr_cod'] == 27
          OR $row['historico_descr_cod'] == 28){
    echo '
    <tr class="bg-secondary text-white">
      <td>'.$row["historico_dataemissao"].'</td>
      <td>'.$row["historico_datamov"].'</td>
      <td>'.$row["historico_descr_nome"].'</td>
      <td>'.$row["historico_doc"].'</td>
      <td>'.$row["historico_num"].'</td>
      <td>'.$row["historico_obs"].'</td>
      <!--td>'.$row["historico_notas"].'</td-->
      <td class="text-right">'.number_format($row["historico_valor"], 2, ",", ".").'</td>
    </tr>';
  } elseif ($row['historico_descr_cod'] == 14 OR $row['historico_descr_cod'] == 17
          OR $row['historico_descr_cod'] == 19 OR $row['historico_descr_cod'] == 26
          OR $row['historico_descr_cod'] == 30){
    echo '
    <tr class="bg-success">
      <td>'.$row["historico_dataemissao"].'</td>
      <td>'.$row["historico_datamov"].'</td>
      <td>'.$row["historico_descr_nome"].'</td>
      <td>'.$row["historico_doc"].'</td>
      <td>'.$row["historico_num"].'</td>
      <td>'.$row["historico_obs"].'</td>
      <!--td>'.$row["historico_notas"].'</td-->
      <td class="text-right">'.number_format($row["historico_valor"], 2, ",", ".").'</td>
    </tr>';
  } else {
    echo '
    <tr>
      <td>'.$row["historico_dataemissao"].'</td>
      <td>'.$row["historico_datamov"].'</td>
      <td>'.$row["historico_descr_nome"].'</td>
      <td>'.$row["historico_doc"].'</td>
      <td>'.$row["historico_num"].'</td>
      <td>'.$row["historico_obs"].'</td>
      <!--td>'.$row["historico_notas"].'</td-->
      <td class="text-right">'.number_format($row["historico_valor"], 2, ",", ".").'</td>
    </tr>';
  }
};
echo '
  </table>';

