<?php
//session_start();
include "../../../global/config/dbConn.php";

$nomeCandidatura = $_GET['nomeCandidatura'];

$sqlCandidatura = "SELECT  *, ca.cand_logo as logo
          FROM processo
          LEFT JOIN candidaturas_submetidas cs on  cs.candoper_codigo = proces_cand
          LEFT JOIN candidaturas_avisos ca on ca.cand_aviso = cs.candsubm_aviso
          LEFT JOIN departamento ON dep_cod = proces_departamento
          WHERE proces_cand LIKE '%".$nomeCandidatura."%'
          AND proces_report_valores = 1
          ORDER BY proces_estado_nome ASC";

$stmt = $myConn->query($sqlCandidatura);
$procesosCandidatura = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($procesosCandidatura as $key) {
  $logoCandidatura[] = $key["logo"];
}

$pathImagens = "../../global/imagens/";
$logo = $pathImagens . $logoCandidatura[0];


$rows = count($procesosCandidatura);

$sqlTotaisCandidatura = "SELECT
          proces_path_imagens,
          SUM(proces_cand_elegivel) AS elegivel
          FROM processo
          WHERE proces_cand LIKE '%".$nomeCandidatura."%'
          AND proces_report_valores = 1";

$stmt = $myConn->query($sqlTotaisCandidatura);
$totaisCandidatura = $stmt->fetchAll(PDO::FETCH_ASSOC);


foreach($totaisCandidatura as $key) {
  $totalCandidatura[] = $key["elegivel"];
  $logoCandidatura[] = $key["proces_path_imagens"];
}


echo '
<div class="card col-md-12">
  <div class="card-body">
  
    <div class="d-flex align-items-center justify-content-between">
    <div class="card-header bg-secondary text-white" >Processos na Candidatura 
    ('.$rows.') - '.number_format($totalCandidatura[0], 2, ",", ".").'€
    </div>
    <img src="'.$logo.'" alt="2030" width="200" height="50">
    </div>
  <h1 class="mt-2"></h1>
    <div class="col col-md-12">
      <div class="row">
        <table class="table table-responsive table-striped small">
        <tr>
          <th>Estado</th>
          <th>DEP</th>
          <th>PADM</th>
          <th>Processo</th>
          <th>Previsto</th>
          <th>Adjudicado</th>
          <th>Faturado</th>
        </tr>';
  foreach($procesosCandidatura as $row) {
  echo '
        <tr onclick="redirectProcesso('.$row["proces_check"].')">
          <td class=" bg-primary text-white">'.$row["proces_estado_nome"].'</td>
          <td class=" bg-secondary text-white">'.$row["dep_sigla"].'</td>
          <td class=" bg-info text-white">'.$row["proces_padm"].'</td>
          <td>'.$row["proces_nome"].'</td>';
          if($row["proces_val_faturacao"] == 0){
    echo '<td class="bg-primary text-white text-right">'.number_format($row["proces_val_max"], 2, ",", ".").'€</td>';
    echo '<td class="bg-secondary text-white text-right">'.number_format($row["proces_val_adjudicacoes"], 2, ",", ".").'€</td>';
    echo '<td class="bg-warning text-white text-right">'.number_format($row["proces_val_faturacao"], 2, ",", ".").'€</td>';
          } else {
    echo '<td class="bg-primary text-white text-right">'.number_format($row["proces_val_max"], 2, ",", ".").'€</td>';
    echo '<td class="bg-secondary text-white text-right">'.number_format($row["proces_val_adjudicacoes"], 2, ",", ".").'€</td>';
    echo '<td class="bg-success text-white text-right">'.number_format($row["proces_val_faturacao"], 2, ",", ".").'€</td>';
          }
    };
  echo '
        </tr>
        </table>
      </div>
    </div>
  </div>
</div>
';

